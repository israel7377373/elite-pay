require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

// ==========================================
// 🍃 CONFIGURAÇÃO DO BANCO DE DADOS (MONGODB)
// ==========================================

const MONGO_URI = process.env.MONGO_URI || 'SUA_STRING_DE_CONEXAO_AQUI_SE_FOR_RODAR_LOCAL';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ CONECTADO AO MONGODB ATLAS COM SUCESSO!');
        console.log('📊 O sistema agora salva tudo na nuvem.');
    })
    .catch(err => {
        console.error('❌ ERRO CRÍTICO AO CONECTAR NO MONGODB:', err);
    });

// ==========================================
// 📝 DEFINIÇÃO DOS MODELOS (SCHEMAS)
// ==========================================

const UserSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    cpf: String,
    phone: String,
    role: { type: String, default: 'user' }, 
    status: { type: String, default: 'PENDENTE' }, 
    saldoCents: { type: Number, default: 0 },
    
    // 🔥 NOVO: SEGURANÇA AVANÇADA
    // allowedIp: Se tiver algo escrito, só loga com esse IP. Se for null, loga com qualquer um.
    allowedIp: { type: String, default: null },   
    // require2fa: Se true, pede código. Se false, entra direto.
    require2fa: { type: Boolean, default: true }, 

    twoFactorCode: String,
    twoFactorExpires: Date,
    
    // Taxas Personalizadas
    custom_rates: {
        deposit_percent: { type: Number, default: 4 },
        deposit_fixed: { type: Number, default: 1.00 },
        withdraw_fixed: { type: Number, default: 1.00 }
    },
    daily_stats: {
        transactionCount: { type: Number, default: 0 },
        totalReceived: { type: Number, default: 0 }
    }
});

const TransactionSchema = new mongoose.Schema({
    id: String,
    userId: Number,
    misticPayId: String,
    ourId: String,
    valorLiquido: Number,
    valorBruto: Number,
    taxaMinha: Number,
    taxaApi: Number,
    markupProfit: { type: Number, default: 0 },
    descricao: String,
    status: String,
    tipo: String, 
    metodo: String,
    criadoEm: Date,
    apiGenerated: { type: Boolean, default: false }
});

const CredentialSchema = new mongoose.Schema({
    userId: Number,
    clientId: String,
    clientSecret: String,
    webhookUrl: String,
    createdAt: Date,
    active: { type: Boolean, default: true }
});

const AllowedIpSchema = new mongoose.Schema({
    userId: Number,
    ip: String,
    createdAt: Date
});

const ApiLogSchema = new mongoose.Schema({
    timestamp: Date,
    userId: Number,
    endpoint: String,
    method: String,
    ip: String,
    body: Object
});

// Criando os Modelos no Banco
const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Credential = mongoose.model('Credential', CredentialSchema);
const AllowedIp = mongoose.model('AllowedIp', AllowedIpSchema);
const ApiLog = mongoose.model('ApiLog', ApiLogSchema);

// ==========================================
// 🔐 CONFIGURAÇÕES DE INTEGRAÇÃO
// ==========================================

const MISTIC_CI = 'ci_jbbmajuwwmq28hv';
const MISTIC_CS = 'cs_isxps89xg5jodulumlayuy40d';
const MISTIC_URL = 'https://api.misticpay.com';

const WPP_API_URL = 'https://api.360messenger.com/v2/sendMessage';
const WPP_API_KEY = 'PkdD5arRul09RjMvE7WvyKHvze3aQyWOFWH';

const ADMIN_EMAIL = 'admin@pay.com';
const ADMIN_PASS = 'admin';

// Taxas Base da Plataforma
const BASE_RATES = {
    deposit_percent: 4,
    deposit_fixed: 1.00,
    withdraw_fixed: 1.00
};

app.use(cors({ 
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID', 'X-Client-Secret'] 
}));

app.use(bodyParser.json());

// Forçar HTTPS em produção
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// ==========================================
// 🛠️ FUNÇÕES DE SUPORTE
// ==========================================

const getIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0];
    if (typeof ip === 'string') return ip.trim().replace('::ffff:', '');
    return '';
};

const formatarNumeroWhatsApp = (numero) => {
    if (!numero) return null;
    let limpo = numero.replace(/\D/g, '');
    if (limpo.length === 10 || limpo.length === 11) {
        limpo = '55' + limpo;
    }
    return limpo;
};

const enviarCodigoWhatsApp = async (numeroBruto, codigo) => {
    const numeroFormatado = formatarNumeroWhatsApp(numeroBruto);
    if (!numeroFormatado) {
        console.error('❌ Erro: Número de telefone inválido:', numeroBruto);
        return false;
    }
    try {
        console.log(`📤 Enviando ZAP para: ${numeroFormatado} via API v2.0`);
        const params = new URLSearchParams();
        params.append('phonenumber', numeroFormatado);
        params.append('text', `🔐 *Elite Pay*: Seu código de verificação é *${codigo}*`);

        const response = await fetch(WPP_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${WPP_API_KEY}` },
            body: params
        });
        
        const data = await response.json();
        if (data.success || response.ok) {
            return true;
        } else {
            console.error('⚠️ Erro na API 360:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro de conexão (DNS/Rede):', error.message);
        return false;
    }
};

const getUserFromToken = async (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];

    // Token especial do Admin
    if (token === 'ADMIN_TOKEN_SECURE') {
        return { id: 0, role: 'admin', status: 'ATIVO', email: ADMIN_EMAIL, name: 'Administrador' };
    }

    let userId = null;
    if (token.startsWith('TOKEN_FIXO_')) {
        userId = parseInt(token.replace('TOKEN_FIXO_', ''));
    } else if (token.startsWith('TOKEN_')) {
        userId = parseInt(token.replace('TOKEN_', ''));
    }

    if (userId) {
        return await User.findOne({ id: userId, status: 'ATIVO' });
    }

    return null;
};

const validateApiCredentials = async (req, res, next) => {
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];

    if (!clientId || !clientSecret) {
        return res.status(401).json({ 
            error: 'Credenciais não fornecidas',
            message: 'Envie X-Client-ID e X-Client-Secret nos headers'
        });
    }

    const creds = await Credential.findOne({ clientId, clientSecret });

    if (!creds) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = await User.findOne({ id: creds.userId });

    if (!user || user.status !== 'ATIVO') {
        return res.status(403).json({ error: 'Usuário inativo ou não encontrado' });
    }

    // Valida IP da API
    const clientIp = getIp(req);
    const allowedIp = await AllowedIp.findOne({ userId: user.id, ip: clientIp });
    const totalIps = await AllowedIp.countDocuments({ userId: user.id });
    
    if (totalIps > 0 && !allowedIp) {
        return res.status(403).json({ error: 'IP não autorizado', ip: clientIp });
    }

    req.apiUser = user;
    req.apiCredentials = creds;
    next();
};

const formatarTransacao = (dados, tipo, user, ip, description) => {
    const isDeposit = tipo === 'DEPOSITO';
    const amount = Number(dados.amount || dados.transactionAmount || 0);

    const userRates = user.custom_rates || { deposit_percent: 4, deposit_fixed: 1, withdraw_fixed: 1 };
    
    let taxaTotal = 0;
    let baseEliteFee = 0;

    if (isDeposit) {
        const taxaPercentual = amount * (userRates.deposit_percent / 100);
        taxaTotal = taxaPercentual + userRates.deposit_fixed;
        const basePercentual = amount * (BASE_RATES.deposit_percent / 100);
        baseEliteFee = basePercentual + BASE_RATES.deposit_fixed;
    } else {
        taxaTotal = userRates.withdraw_fixed;
        baseEliteFee = BASE_RATES.withdraw_fixed;
    }

    let markupProfit = taxaTotal - baseEliteFee;
    if (markupProfit < 0) markupProfit = 0;

    const valorLiquido = isDeposit ? (amount - taxaTotal) : amount;
    const valorBruto = amount;

    return {
        id: dados.transactionId || `tx_${Date.now()}`,
        userId: user.id, 
        valorLiquido: parseFloat(valorLiquido.toFixed(2)), 
        valorBruto: parseFloat(valorBruto.toFixed(2)), 
        taxaMinha: parseFloat(taxaTotal.toFixed(2)), 
        taxaApi: 1.00, 
        markupProfit: parseFloat(markupProfit.toFixed(2)), 
        descricao: description || (isDeposit ? 'Depósito Elite Pay' : 'Saque Elite Pay'),
        status: dados.transactionState ? dados.transactionState.toLowerCase() : (isDeposit ? 'pendente' : 'aprovado'),
        tipo: isDeposit ? 'deposito' : 'saque',
        metodo: "PIX",
        criadoEm: dados.createdAt || new Date()
    };
};

// Middleware de Autenticação
const checkAuth = async (req, res, next) => {
    try {
        req.user = await getUserFromToken(req);
        if (req.user && (req.user.status === 'ATIVO' || req.user.role === 'admin' || req.user.role === 'partner')) {
            return next();
        }
        console.log('🚫 REQUISIÇÃO BLOQUEADA: 401 Unauthorized');
        return res.status(401).json({ error: 'Token inválido ou sessão expirada' });
    } catch (e) {
        return res.status(401).json({ error: 'Erro de autenticação' });
    }
};

const checkAdminOrPartner = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'partner') next();
    else res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
};

// ==========================================
// 🚀 ROTAS DE LOGIN & CADASTRO & 2FA
// ==========================================
const authRoutes = express.Router();

authRoutes.post('/login', async (req, res) => {
    const { email, senha, password } = req.body;
    const pass = senha || password;
    const clientIp = getIp(req); // Pega IP do cliente

    // 1. Login Admin Mestre
    if (email === ADMIN_EMAIL) {
        if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'Senha incorreta' });
        return res.status(200).json({ 
            success: true,
            token: 'ADMIN_TOKEN_SECURE', 
            user: { id: 0, role: 'admin', name: 'Admin', email: ADMIN_EMAIL }, 
            require2fa: false,
            redirectTo: '/admin/dashboard'
        });
    }

    // 2. Busca no Mongo
    const user = await User.findOne({ email: email });

    if (!user || user.password !== pass) {
        return res.status(401).json({ error: 'Login incorreto' });
    }

    if (user.status === 'PENDENTE') {
        return res.status(403).json({ 
            error: 'Cadastro em análise', 
            message: 'Sua conta ainda está pendente de aprovação pelo administrador.' 
        });
    }

    if (user.status !== 'ATIVO') return res.status(403).json({ error: 'Conta bloqueada ou inativa.' });

    // =================================================================
    // 🔥 NOVA LÓGICA DE SEGURANÇA (IP WHITELIST & 2FA SWITCH)
    // =================================================================

    // 3. Verificação de IP (Se estiver configurado)
    if (user.allowedIp && user.allowedIp.trim() !== '') {
        // Verifica se o IP que está tentando entrar contém o IP autorizado
        if (!clientIp.includes(user.allowedIp)) {
            console.warn(`🚫 Login bloqueado por IP. User: ${user.email}, IP Esperado: ${user.allowedIp}, IP Real: ${clientIp}`);
            return res.status(403).json({ 
                error: 'Acesso Negado', 
                message: `Este IP (${clientIp}) não está autorizado para esta conta.` 
            });
        }
        console.log(`✅ IP validado para ${user.email}: ${clientIp}`);
    }

    // 4. Verificação de 2FA (WhatsApp)
    // Se require2fa for false, pula o envio de código e entra direto
    if (user.require2fa === false) {
        console.log(`⏩ Login direto (2FA Desativado) para: ${user.email}`);
        return res.status(200).json({ 
            success: true, 
            token: 'TOKEN_' + user.id, 
            user: { id: user.id, name: user.name, role: user.role, email: user.email }, 
            require2fa: false 
        });
    }

    // --- Se chegou aqui, 2FA é Obrigatório (Fluxo Normal) ---
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorExpires = Date.now() + (5 * 60 * 1000); // 5 minutos

    await user.save(); 

    console.log(`🔄 Código 2FA gerado para ${user.name}: ${code}`);

    if (user.phone) {
        await enviarCodigoWhatsApp(user.phone, code);
    }

    res.status(200).json({ 
        success: true,
        require2fa: true, 
        email: user.email,
        phoneMask: user.phone ? '****' + user.phone.slice(-4) : 'desconhecido',
        message: 'Senha correta. Digite o código enviado ao seu WhatsApp.' 
    });
});

authRoutes.post('/verify-2fa', async (req, res) => {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

    if (!user.twoFactorCode || !user.twoFactorExpires) {
        return res.status(400).json({ error: 'Nenhum código solicitado. Faça login novamente.' });
    }

    if (Date.now() > user.twoFactorExpires) {
        return res.status(400).json({ error: 'O código expirou.' });
    }

    if (String(user.twoFactorCode) !== String(code)) {
        return res.status(401).json({ error: 'Código incorreto!' });
    }

    // ✅ SUCESSO
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save(); 

    console.log(`✅ 2FA Validado para ${user.email}.`);
    
    res.status(200).json({ 
        success: true,
        token: 'TOKEN_' + user.id, 
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        },
        redirectTo: '/dashboard'
    });
});

authRoutes.post('/register', async (req, res) => {
    const { email, name, password, cpf, phone } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const newId = Date.now(); 

    const newUser = new User({
        id: newId,
        email, name, password, cpf, phone,
        status: 'PENDENTE', 
        role: 'user',
        saldoCents: 0,
        custom_rates: { deposit_percent: 4, deposit_fixed: 1, withdraw_fixed: 1 },
        // Padrões de segurança no registro
        require2fa: true,
        allowedIp: null
    });

    await newUser.save();
    
    console.log(`📝 Novo usuário registrado no Mongo: ${email}`);
    
    res.status(201).json({ 
        success: true,
        message: 'Cadastro realizado! Sua conta está em análise.', 
        user: { email: newUser.email, status: newUser.status } 
    });
});

authRoutes.get('/me', checkAuth, (req, res) => {
    if(req.user) res.json(req.user);
    else res.status(401).json({error: 'Sessão expirada'});
});
app.use('/api/auth', authRoutes);


// ==========================================
// 💸 ROTAS DE TRANSAÇÃO (DASHBOARD)
// ==========================================
const txRoutes = express.Router();

txRoutes.post('/create', checkAuth, async (req, res) => {
    const { amount, description } = req.body;
    const user = req.user;

    const amountFloat = Number(amount);
    const transactionId = `tx_${Date.now()}_${user.id}`;
    const payerDocument = user.cpf || '00000000000';

    const requestBody = {
        amount: amountFloat,
        description: description || 'Depósito Elite Pay',
        payerName: user.name || 'Cliente Elite Pay', 
        payerDocument: payerDocument, 
        transactionId: transactionId,
        webhookUrl: `${process.env.BASE_URL || 'https://elite-pay-backend.onrender.com'}/api/transactions/webhook`,
    };

    console.log(`➡️ REQ MisticPay: ${JSON.stringify(requestBody)}`);

    try {
        const misticResponse = await fetch(`${MISTIC_URL}/api/transactions/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ci': MISTIC_CI, 'cs': MISTIC_CS },
            body: JSON.stringify(requestBody)
        });

        const data = await misticResponse.json();
        
        if (!misticResponse.ok) {
            return res.status(misticResponse.status).json({ 
                error: data.message || 'Erro na API MisticPay.', 
                details: data
            });
        }
        
        const qrcodeUrl = data.qrcodeUrl || data.qrCodeUrl || data.data?.qrcodeUrl;
        const copyPaste = data.copyPaste || data.copy_paste || data.data?.copyPaste;
        
        if (!qrcodeUrl) {
             return res.status(500).json({ error: 'Transação sem QR Code.' });
        }

        const txData = formatarTransacao(
            { 
                ...data, 
                transactionState: 'PENDENTE', 
                amount: amountFloat, 
                transactionId: transactionId, 
                createdAt: new Date() 
            }, 
            'DEPOSITO', user, getIp(req), description
        );
        txData.misticPayId = data.data?.transactionId || data.transactionId;
        txData.ourId = transactionId;
        
        const novaTx = new Transaction(txData);
        await novaTx.save();
        
        res.json({
            qrcodeUrl: qrcodeUrl, 
            copyPaste: copyPaste,
            data: novaTx 
        });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

txRoutes.post('/webhook', async (req, res) => {
    console.log('📥 WEBHOOK RECEBIDO');
    
    const { transactionId, transactionState, status, state } = req.body;
    const statusFinal = transactionState || status || state || req.body.data?.status;
    const txId = transactionId || req.body.id || req.body.data?.transactionId;

    const transaction = await Transaction.findOne({
        $or: [
            { id: txId }, 
            { misticPayId: txId }, 
            { ourId: txId }
        ]
    });

    if (!transaction) {
        console.error('❌ Transação não encontrada no banco:', txId);
        return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const statusAprovado = ['COMPLETE', 'COMPLETED', 'COMPLETO', 'APPROVED', 'PAID', 'CONFIRMED', 'aprovado', 'pago', 'confirmado'];
    const statusRecebidoUpper = String(statusFinal).toUpperCase();

    if (statusAprovado.includes(statusRecebidoUpper) && transaction.status !== 'aprovado') {
        transaction.status = 'aprovado';
        await transaction.save(); 

        const user = await User.findOne({ id: transaction.userId });
        if (user) {
            const valorEmCentavos = Math.round(transaction.valorLiquido * 100);
            user.saldoCents += valorEmCentavos;

            if (!user.daily_stats) user.daily_stats = { transactionCount: 0, totalReceived: 0 };
            user.daily_stats.transactionCount += 1;
            user.daily_stats.totalReceived += transaction.valorLiquido;

            await user.save(); 
            console.log(`✅ Saldo creditado para ${user.name}: +R$${transaction.valorLiquido}`);
        }
    }

    res.status(200).json({ success: true, message: 'Webhook processado' });
});

txRoutes.post('/withdraw', checkAuth, async (req, res) => {
    const { amount, pixKey, pixKeyType, description } = req.body;
    const user = req.user;

    const amountFloat = Number(amount);
    
    const taxaSaque = user.custom_rates?.withdraw_fixed || 1.00;
    const totalDebit = amountFloat + taxaSaque;
    const transactionId = `out_${Date.now()}_${user.id}`;

    const saldoDisponivel = user.saldoCents / 100;
    if (saldoDisponivel < totalDebit) {
        return res.status(402).json({ 
            error: `Saldo insuficiente. Disp: R$ ${saldoDisponivel.toFixed(2)}` 
        });
    }

    try {
        const misticResponse = await fetch(`${MISTIC_URL}/api/transactions/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ci': MISTIC_CI, 'cs': MISTIC_CS },
            body: JSON.stringify({
                amount: amountFloat,
                pixKey: pixKey,
                pixKeyType: pixKeyType,
                description: description || 'Saque Elite Pay',
                transactionId: transactionId,
            })
        });

        const data = await misticResponse.json();
        
        if (!misticResponse.ok) {
            return res.status(misticResponse.status).json({ 
                error: data.message || 'Erro na API de Saque.', 
                details: data
            });
        }
        
        user.saldoCents -= Math.round(totalDebit * 100);
        await user.save();

        const markup = taxaSaque - BASE_RATES.withdraw_fixed;
        
        const txData = formatarTransacao(
            { ...data, transactionState: 'COMPLETO', amount: amountFloat, transactionId: transactionId, createdAt: new Date() }, 
            'RETIRADA', user, getIp(req), description
        );

        txData.markupProfit = markup > 0 ? markup : 0;
        
        const novaTx = new Transaction(txData);
        await novaTx.save();

        res.json({ success: true, message: 'Saque realizado com sucesso', transaction: novaTx });

    } catch (error) {
        console.error('❌ Erro saque:', error);
        res.status(500).json({ error: 'Erro interno no saque' });
    }
});

txRoutes.get('/', checkAuth, async (req, res) => {
    const user = req.user;
    if (user.role === 'admin' || user.role === 'partner') {
        const txs = await Transaction.find().sort({ criadoEm: -1 }).limit(100);
        return res.json({ success: true, transactions: txs });
    }
    const minhasTransacoes = await Transaction.find({ userId: user.id }).sort({ criadoEm: -1 });
    res.json({ success: true, transactions: minhasTransacoes });
});

app.use('/api/transactions', txRoutes);

// ==========================================
// 🛡️ ROTAS ADMIN & PARTNER (NOVAS FUNÇÕES)
// ==========================================

// Listar Usuários
app.get('/api/users', checkAuth, checkAdminOrPartner, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Atualizar Status E Taxas Personalizadas
app.put('/api/users/:id/status', checkAuth, checkAdminOrPartner, async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.status) user.status = req.body.status;

    if (req.body.custom_rates) {
        user.custom_rates = {
            deposit_percent: Number(req.body.custom_rates.deposit_percent),
            deposit_fixed: Number(req.body.custom_rates.deposit_fixed),
            withdraw_fixed: Number(req.body.custom_rates.withdraw_fixed)
        };
        console.log(`💰 Taxas atualizadas para ${user.email} por ${req.user.role}`);
    }

    await user.save();
    res.json({ success: true });
});

// 🔥 NOVA ROTA: ATUALIZAR SEGURANÇA (IP E 2FA)
// Recebe { allowedIp: '...', require2fa: true/false }
app.put('/api/admin/users/:id/security', checkAuth, checkAdminOrPartner, async (req, res) => {
    const { id } = req.params;
    const { allowedIp, require2fa } = req.body; 

    try {
        const user = await User.findOne({ id: id });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        // Atualiza os campos
        user.allowedIp = allowedIp; 
        user.require2fa = require2fa;
        
        await user.save();
        
        console.log(`🛡️ Segurança atualizada para ${user.email}: IP=${allowedIp}, 2FA=${require2fa}`);
        res.json({ success: true, message: 'Configurações de segurança salvas.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao atualizar segurança.' });
    }
});

// Deletar Usuário (Limpeza Completa)
app.delete('/api/admin/users/:id', checkAuth, checkAdminOrPartner, async (req, res) => {
    const userId = req.params.id;
    try {
        await User.deleteOne({ id: userId });
        await Transaction.deleteMany({ userId: userId });
        await Credential.deleteMany({ userId: userId });
        await AllowedIp.deleteMany({ userId: userId });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});

// Editar Telefone
app.put('/api/admin/users/:id/phone', checkAuth, checkAdminOrPartner, async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if(user) { 
        user.phone = req.body.phone; 
        await user.save(); 
        res.json({success:true}); 
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

// 💰 RELATÓRIO DE LUCRO INTELIGENTE (ADMIN vs PARTNER)
app.get('/api/admin/financial-stats', checkAuth, checkAdminOrPartner, async (req, res) => {
    const agora = new Date();
    const inicioDia = new Date(agora.setHours(0,0,0,0));
    const inicioSemana = new Date(); 
    inicioSemana.setDate(new Date().getDate() - new Date().getDay()); 
    inicioSemana.setHours(0,0,0,0);
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const transacoes = await Transaction.find({ 
        status: { $in: ['aprovado', 'completo', 'pago', 'completed', 'COMPLETO'] } 
    });

    let lucroDia = 0, lucroSemana = 0, lucroMes = 0;

    transacoes.forEach(tx => {
        const dataTx = new Date(tx.criadoEm);
        let lucroDaTransacao = 0;

        if (req.user.role === 'partner') {
            lucroDaTransacao = tx.markupProfit || 0; 
        } else {
            lucroDaTransacao = (tx.taxaMinha || 0) - (tx.markupProfit || 0);
        }

        if (dataTx >= inicioDia) lucroDia += lucroDaTransacao;
        if (dataTx >= inicioSemana) lucroSemana += lucroDaTransacao;
        if (dataTx >= inicioMes) lucroMes += lucroDaTransacao;
    });

    res.json({ lucro_dia: lucroDia, lucro_semana: lucroSemana, lucro_mes: lucroMes });
});

app.get('/api/logs', checkAuth, checkAdminOrPartner, async (req, res) => {
    const logs = await ApiLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

// ==========================================
// 🔑 ROTAS DE CREDENCIAIS (✅ CORRIGIDAS)
// ==========================================
const credRoutes = express.Router();

// 🔥 GET - Buscar credenciais existentes
credRoutes.get('/', checkAuth, async (req, res) => {
    try {
        // ✅ CORREÇÃO: Usa diretamente req.user.id (propriedade, não método)
        const userId = req.user.id;
        
        console.log(`🔍 Buscando credenciais para userId: ${userId}`);
        
        const creds = await Credential.findOne({ userId: userId });
        
        if (creds) {
            console.log(`✅ Credenciais encontradas para userId ${userId}`);
            return res.json({
                hasCredentials: true,
                clientId: creds.clientId,
                clientSecret: creds.clientSecret,
                webhookUrl: creds.webhookUrl,
                createdAt: creds.createdAt
            });
        } else {
            console.log(`⚠️ Nenhuma credencial encontrada para userId ${userId}`);
            return res.json({ hasCredentials: false });
        }
    } catch (error) {
        console.error('❌ Erro ao buscar credenciais:', error);
        return res.status(500).json({ error: 'Erro ao buscar credenciais' });
    }
});

// 🔥 POST - Gerar novas credenciais
credRoutes.post('/generate', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(`🔑 Gerando novas credenciais para userId: ${userId}`);
        
        // Remove credenciais antigas se existirem
        await Credential.deleteMany({ userId: userId });
        
        // Cria novas credenciais
        const newCreds = new Credential({
            userId: userId,
            clientId: 'live_' + crypto.randomBytes(16).toString('hex'),
            clientSecret: 'sk_' + crypto.randomBytes(32).toString('hex'),
            webhookUrl: req.body.webhookUrl || '', // Permite configurar webhook
            createdAt: new Date(),
            active: true
        });
        
        await newCreds.save();
        
        console.log(`✅ Credenciais criadas com sucesso para userId ${userId}`);
        console.log(`📋 Client ID: ${newCreds.clientId}`);
        
        res.json({
            success: true,
            clientId: newCreds.clientId,
            clientSecret: newCreds.clientSecret,
            webhookUrl: newCreds.webhookUrl,
            createdAt: newCreds.createdAt
        });
    } catch (error) {
        console.error('❌ Erro ao gerar credenciais:', error);
        res.status(500).json({ error: 'Erro ao gerar credenciais' });
    }
});

// 🔥 DELETE - Remover credenciais
credRoutes.delete('/', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(`🗑️ Deletando credenciais para userId: ${userId}`);
        
        const resultado = await Credential.deleteMany({ userId: userId });
        
        console.log(`✅ ${resultado.deletedCount} credencial(is) deletada(s)`);
        
        res.json({ 
            success: true, 
            message: 'Credenciais removidas com sucesso',
            deletedCount: resultado.deletedCount
        });
    } catch (error) {
        console.error('❌ Erro ao deletar credenciais:', error);
        res.status(500).json({ error: 'Erro ao deletar credenciais' });
    }
});

// 🔥 GET - Listar IPs autorizados
credRoutes.get('/ips', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userIps = await AllowedIp.find({ userId: userId });
        
        console.log(`🌐 ${userIps.length} IP(s) autorizado(s) para userId ${userId}`);
        
        res.json({ ips: userIps });
    } catch (error) {
        console.error('❌ Erro ao buscar IPs:', error);
        res.status(500).json({ error: 'Erro ao buscar IPs' });
    }
});

// 🔥 POST - Adicionar IP autorizado
credRoutes.post('/ips', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { ip } = req.body;
        
        if (!ip) {
            return res.status(400).json({ error: 'IP não fornecido' });
        }
        
        // Verifica se já existe
        const ipExistente = await AllowedIp.findOne({ userId: userId, ip: ip });
        
        if (ipExistente) {
            return res.status(400).json({ error: 'Este IP já está autorizado' });
        }
        
        const newIp = new AllowedIp({
            userId: userId,
            ip: ip,
            createdAt: new Date()
        });
        
        await newIp.save();
        
        console.log(`✅ IP ${ip} adicionado para userId ${userId}`);
        
        res.json({
            success: true,
            ip: newIp
        });
    } catch (error) {
        console.error('❌ Erro ao adicionar IP:', error);
        res.status(500).json({ error: 'Erro ao adicionar IP' });
    }
});

// 🔥 DELETE - Remover IP autorizado
credRoutes.delete('/ips/:id', checkAuth, async (req, res) => {
    try {
        const resultado = await AllowedIp.findByIdAndDelete(req.params.id);
        
        if (!resultado) {
            return res.status(404).json({ error: 'IP não encontrado' });
        }
        
        console.log(`✅ IP deletado: ${resultado.ip}`);
        
        res.json({ 
            success: true,
            message: 'IP removido com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao deletar IP:', error);
        res.status(500).json({ error: 'Erro ao deletar IP' });
    }
});

app.use('/api/credentials', credRoutes);

// ==========================================
// 🌐 ROTAS PÚBLICAS DA API
// ==========================================
const publicApiRoutes = express.Router();

publicApiRoutes.get('/docs', (req, res) => {
    res.json({
        name: 'Elite Pay API',
        version: '2.0.0 (MongoDB)',
        endpoints: {
            deposit: 'POST /api/v1/deposit',
            withdraw: 'POST /api/v1/withdraw',
            balance: 'GET /api/v1/balance'
        }
    });
});

publicApiRoutes.post('/deposit', validateApiCredentials, async (req, res) => {
    const { amount, description, payerName, payerDocument } = req.body;
    const user = req.apiUser;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Valor inválido' });

    const amountFloat = Number(amount);
    const transactionId = `api_tx_${Date.now()}_${user.id}`;

    new ApiLog({
        timestamp: new Date(),
        userId: user.id,
        endpoint: '/deposit',
        method: 'POST',
        ip: getIp(req),
        body: req.body
    }).save();

    const requestBody = {
        amount: amountFloat,
        description: description || `Depósito API - ${user.name}`,
        payerName: payerName || user.name, 
        payerDocument: payerDocument || user.cpf || '00000000000', 
        transactionId: transactionId,
    };

    try {
        const misticResponse = await fetch(`${MISTIC_URL}/api/transactions/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ci': MISTIC_CI, 'cs': MISTIC_CS },
            body: JSON.stringify(requestBody)
        });

        const data = await misticResponse.json();
        
        if (!misticResponse.ok) return res.status(500).json({ success: false, error: 'Erro MisticPay' });
        
        const qrcodeUrl = data.qrcodeUrl || data.qrCodeUrl;
        const copyPaste = data.copyPaste || data.copy_paste;

        if (!qrcodeUrl) return res.status(500).json({ success: false, error: 'QR Code falhou' });

        const txData = formatarTransacao(
            { 
                ...data, 
                transactionState: 'PENDENTE', 
                amount: amountFloat, 
                transactionId: transactionId, 
                createdAt: new Date() 
            }, 
            'DEPOSITO', user, getIp(req), description
        );
        txData.misticPayId = data.data?.transactionId;
        txData.apiGenerated = true;
        
        const novaTx = new Transaction(txData);
        await novaTx.save();
        
        res.json({
            success: true,
            transactionId: transactionId,
            qrcodeUrl: qrcodeUrl,
            copyPaste: copyPaste,
            status: 'PENDENTE'
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

publicApiRoutes.post('/withdraw', validateApiCredentials, async (req, res) => {
    const { amount, pixKey, pixKeyType, description } = req.body;
    const user = req.apiUser;
    const amountFloat = Number(amount);
    
    const taxaSaque = user.custom_rates?.withdraw_fixed || 1.00;
    const totalDebit = amountFloat + taxaSaque;
    const transactionId = `api_out_${Date.now()}_${user.id}`;

    new ApiLog({
        timestamp: new Date(),
        userId: user.id,
        endpoint: '/withdraw',
        method: 'POST',
        ip: getIp(req),
        body: { ...req.body, pixKey: '***' }
    }).save();

    if ((user.saldoCents/100) < totalDebit) {
        return res.status(402).json({ success: false, error: 'Saldo insuficiente' });
    }

    try {
        const misticResponse = await fetch(`${MISTIC_URL}/api/transactions/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ci': MISTIC_CI, 'cs': MISTIC_CS },
            body: JSON.stringify({
                amount: amountFloat,
                pixKey, pixKeyType, description: description || 'Saque API', transactionId
            })
        });

        const data = await misticResponse.json();
        if (!misticResponse.ok) return res.status(500).json({ success: false, error: 'Erro API Saque' });
        
        user.saldoCents -= Math.round(totalDebit * 100);
        await user.save();
        
        const markup = taxaSaque - BASE_RATES.withdraw_fixed;

        const txData = formatarTransacao(
            { ...data, transactionState: 'COMPLETO', amount: amountFloat, transactionId: transactionId, createdAt: new Date() }, 
            'RETIRADA', user, getIp(req), description
        );
        txData.markupProfit = markup > 0 ? markup : 0;
        txData.apiGenerated = true;
        
        const novaTx = new Transaction(txData);
        await novaTx.save();

        res.json({ success: true, transactionId, status: 'COMPLETO' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

publicApiRoutes.get('/balance', validateApiCredentials, (req, res) => {
    res.json({ success: true, balance: req.apiUser.saldoCents / 100 });
});

publicApiRoutes.get('/transactions', validateApiCredentials, async (req, res) => {
    const txs = await Transaction.find({ userId: req.apiUser.id }).sort({ criadoEm: -1 }).limit(50);
    res.json({ success: true, transactions: txs });
});

app.use('/api/v1', publicApiRoutes);

// ==========================================
// 📊 NOVA ROTA: DASHBOARD STATS (USER)
// ==========================================
app.get('/api/dashboard/stats', checkAuth, async (req, res) => {
    const user = req.user;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);

    const txs = await Transaction.find({
        userId: user.id,
        criadoEm: { $gte: start, $lte: end },
        status: { $in: ['aprovado', 'completo', 'pago', 'completed', 'COMPLETO'] }
    });

    let rec = 0, wit = 0;
    txs.forEach(tx => {
        if (tx.tipo === 'deposito') rec += tx.valorLiquido;
        else wit += tx.valorBruto;
    });

    res.json({ saldo_atual: user.saldoCents / 100, total_recebido_hoje: rec, total_sacado_hoje: wit, transacoes_hoje: txs.length });
});

// ==========================================
// 🐛 ROTA DE DEBUG (OPCIONAL - REMOVER EM PRODUÇÃO)
// ==========================================
app.get('/api/debug/credentials', checkAuth, async (req, res) => {
    const userId = req.user.id;
    const allCreds = await Credential.find();
    const userCreds = await Credential.find({ userId: userId });
    
    res.json({
        currentUserId: userId,
        currentUserEmail: req.user.email,
        totalCredentialsInDatabase: allCreds.length,
        userCredentials: userCreds,
        allCredentials: allCreds.map(c => ({ 
            userId: c.userId, 
            clientId: c.clientId.substring(0, 15) + '...', 
            createdAt: c.createdAt 
        }))
    });
});

// Rota Raiz
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        database: 'MongoDB', 
        version: '2.0.1 - Credenciais Persistentes',
        timestamp: new Date()
    });
});

// Inicialização
app.listen(PORT, () => {
    console.log(`✅ SERVIDOR RODANDO NA PORTA ${PORT}`);
    console.log(`🍃 MONGODB INTEGRADO E ATIVO`);
    console.log(`🔑 Sistema de Credenciais Persistentes - ATIVO`);
});
