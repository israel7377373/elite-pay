require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Criar pasta logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ========================================
// CONFIGURAÇÃO DO CORS (AQUI ESTÁ A MUDANÇA!)
// ========================================
// Lista de sites que podem falar com esta API
const allowedOrigins = [
  'https://elitepaybr.com',      // Seu site oficial na Hostinger
  'http://localhost:5173',     // Seu computador para desenvolvimento
  process.env.FRONTEND_URL     // A variável do .env (para garantir)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite conexões sem 'origin' (ex: apps de celular, Postman)
    if (!origin) return callback(null, true);

    // Se a 'origin' da requisição ESTÁ na nossa lista, permite
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Se NÃO ESTÁ na lista, bloqueia
      callback(new Error('CORS: Acesso bloqueado. Origem não permitida.'), false);
    }
  },
  credentials: true
}));
// ========================================

app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde'
});
app.use('/api/', limiter);

// Initialize database
try {
  const { initializeDatabase } = require('./config/database');
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// ========================================
// ROTAS
// ========================================
const authRoutes = require('./routes/auth');
const transactionsRoutes = require('./routes/transactions');
const webhookRoutes = require('./routes/webhook');
const apiCredentialsRoutes = require('./routes/api-credentials');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/credentials', apiCredentialsRoutes);
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Elite Pay API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      transactions: '/api/transactions/*',
      webhook: '/webhook/mistic',
      credentials: '/api/credentials/*'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║      🏛️  ELITE PAY - BACKEND         ║
  ║                                       ║
  ║  Server: http://localhost:${PORT}        ║
  ║  Health: http://localhost:${PORT}/health ║
  ║  Auth:   /api/auth/* ║
  ║  Trans:  /api/transactions/* ║
  ║  Creds:  /api/credentials/* ║
  ║  Hook:   /webhook/mistic              ║
  ║  Status: ONLINE ✅                    ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
  `);
});


module.exports = app;
