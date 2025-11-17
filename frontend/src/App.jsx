import React, { useState, useEffect } from "react";
import { Shield, DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight, User, LogOut, Copy, QrCode, Search, Filter, Download, Check, X, Clock } from "lucide-react";
// NO TOPO DO ARQUIVO App.jsx, logo após os imports do React

// Logo Component
const Logo = () => (
  <div className="flex items-center gap-3">
    {/* Logo - Imagem */}
    <img 
      src="/logo.png"
      alt="" 
      className="h-16 w-auto object-contain"
    />
    
    {/* Texto ELITE PAY */}
    <div className="flex flex-col leading-none">
      <span 
        className="text-3xl font-black tracking-wider"
        style={{
          color: '#cdcadb',
          fontFamily: 'Arial Black, Impact, sans-serif',
          letterSpacing: '0.1em',
          textShadow: '0 0 10px rgba(212, 168, 83, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
          filter: 'brightness(1.1)'
        }}
      >
        ELITE
      </span>
      <span 
        className="text-xl font-black tracking-wider -mt-1"
        style={{
          color: '#AB82FF',
          fontFamily: 'Arial Black, Impact, sans-serif',
          letterSpacing: '0.15em',
          textShadow: '0 0 10px rgba(212, 168, 83, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
          filter: 'brightness(1.1)'
        }}
      >
        PAY
      </span>
    </div>
  </div>
);

const API_URL = "http://localhost:4000";



const api = {
  register: async (data) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar conta');
    }
    return response.json();
  },

  login: async (email, senha) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login falhou');
    }
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    return response.json();
  },

  createPix: async (token, amount, description) => {
    const response = await fetch(`${API_URL}/api/transactions/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, description })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar PIX');
    }
    return response.json();
  },

  withdraw: async (token, amount, pixKey, pixKeyType, description) => {
    const response = await fetch(`${API_URL}/api/transactions/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, pixKey, pixKeyType, description })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao processar saque');
    }
    return response.json();
  },

  getTransactions: async (token) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar transações');
    return response.json();
  }
};

// Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 rounded-xl border border-purple-500/20 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-semibold mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-semibold mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px]`}>
        {type === 'success' && <Check className="w-5 h-5" />}
        {type === 'error' && <X className="w-5 h-5" />}
        {type === 'info' && <Clock className="w-5 h-5" />}
        <span className="flex-1 font-medium">{message}</span>
        <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-purple-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Recuperar Senha - Etapa 1
const ForgotPasswordPage = ({ onBack, onCodeSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar código');
      }

      onCodeSent(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-gray-400">Digite seu e-mail para receber o código de recuperação</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onBack} className="text-purple-400 text-sm font-medium hover:underline">
              Lembrou da senha? Fazer login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recuperar Senha - Etapa 2
const ResetPasswordPage = ({ email, onBack, onSuccess }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido ou expirado');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Nova Senha</h1>
            <p className="text-gray-400">Digite o código recebido e sua nova senha</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Código de Recuperação
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código recebido via e-mail"
                required
                maxLength={6}
                className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onBack} className="text-purple-400 text-sm font-medium hover:underline">
              Voltar para envio de código
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    tipoConta: 'PF',
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})/, '$1-$2');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Você deve aceitar os termos de uso');
      return;
    }

    setLoading(true);

    try {
      const data = await api.register({
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        termsAccepted: formData.termsAccepted
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="ELITE Pay"
              className="w-40 h-40 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">Criar Conta</h2>
          <p className="text-gray-400">Preencha seus dados para começar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Select
            label="Tipo de Conta"
            value={formData.tipoConta}
            onChange={(e) => setFormData(prev => ({ ...prev, tipoConta: e.target.value }))}
            options={[
              { value: 'PF', label: 'Pessoa Física (CPF)' },
              { value: 'PJ', label: 'Pessoa Jurídica (CNPJ)' }
            ]}
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="João Silva"
              required
            />

            <Input
              label={formData.tipoConta === 'PF' ? 'CPF' : 'CNPJ'}
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
              placeholder={formData.tipoConta === 'PF' ? '123.456.789-00' : '12.345.678/0001-00'}
              required
            />

            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
              placeholder="(11) 98765-4321"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="mt-1"
              />
              <span className="text-sm text-gray-400">
                Eu li e concordo com os <span className="text-purple-400">Termos de Uso</span> e <span className="text-purple-400">Política de Privacidade</span>
              </span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-6">
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
          >
            Voltar para Login
          </button>
        </form>
      </Card>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, onRegister, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(email, senha);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Entrar</h1>
            <p className="text-gray-400">Acesse sua conta do Elite Pay</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <button 
                 type="button" 
                 onClick={onForgotPassword}
                 className="text-purple-400 text-sm hover:underline"
            >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          {/* Criar Conta */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem conta?{' '}
              <button onClick={onRegister} className="text-purple-400 font-medium hover:underline">
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// Receber PIX Page
const ReceberPixPage = ({ token, onBack }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(''); // ✅ ADICIONADO

  const handleGenerateQRCode = async () => {
  if (amount < 1) {
    setToast({ message: 'Valor mínimo é R$ 1,00', type: 'error' });
    return;
  }

  setLoading(true);
  setError('');
  setPixData(null);

  try {
    console.log('🚀 Iniciando requisição...');
    console.log('💰 Valor enviado:', amount);

    // ✅ CORRIGIDO - rota correta e porta 4000
    const response = await fetch('http://localhost:4000/api/transactions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description: description || 'Pagamento via PIX'
      })
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Response OK?:', response.ok);

    const data = await response.json();

    console.log('📦 Resposta completa da API:', data);

    // --- INÍCIO DO CÓDIGO DE DEBUG ADICIONADO ---
    try {
      console.log('====== DADOS REAIS DA API (FORMATADO) ======');
      // A 'data' é a variável que veio do response.json()
      console.log(JSON.stringify(data, null, 2));
      console.log('============================================');
    } catch (e) {
      console.error('Erro ao formatar o JSON da resposta:', e);
    }
    // --- FIM DO CÓDIGO DE DEBUG ---

    console.log('🔍 Todas as chaves:', Object.keys(data));

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Erro ao gerar QR Code');
    }

    console.log('🖼️ QR Code URL:', data.qrcodeUrl); // Provavelmente vai dar 'undefined'
    console.log('📋 Chave Copia e Cola:', data.copyPaste); // Provavelmente vai dar 'undefined'

    // Os campos vêm direto da API como qrcodeUrl e copyPaste
    setPixData(data);
    setToast({ message: 'QR Code gerado com sucesso!', type: 'success' });

  } catch (err) {
    console.error('❌ Erro completo:', err);
    setError(err.message);
    setToast({ message: err.message || 'Erro ao gerar QR Code', type: 'error' });
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copiado para área de transferência!', type: 'success' });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
        ← Voltar ao Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <QrCode className="text-purple-400" />
          Receber via Pix
        </h1>
        <p className="text-gray-400">Gere um QR Code para receber pagamentos via PIX</p>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-bold text-white mb-6">Gerar QR Code PIX</h2>

        {!pixData ? (
          <div className="space-y-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pagamento de..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            <Button onClick={handleGenerateQRCode} disabled={loading} className="w-full">
              <QrCode className="w-5 h-5" />
              {loading ? 'Gerando...' : 'Gerar QR Code'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-400">
              <p className="font-semibold mb-2">💡 Informações importantes:</p>
              <ul className="space-y-1 text-xs">
                <li>• Taxa Elite Pay: 4% do valor</li>
                <li>• Taxa de processamento: R$ 1,00</li>
                <li>• Valor mínimo: R$ 3,00</li>
                <li>• Exemplo: Cobrança de R$ 100 = Você recebe R$ 95</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block bg-white p-6 rounded-xl">
                
                {/* ✅ CORREÇÃO AQUI: 
                  Removemos a verificação 'pixData.qrcodeUrl.startsWith('data:image')' 
                  Agora, qualquer URL válida em 'pixData.qrcodeUrl' será exibida.
                */}
                {pixData.qrcodeUrl && pixData.qrcodeUrl !== 'N/A' ? (
                  <img 
                    src={pixData.qrcodeUrl} 
                    alt="QR Code PIX" 
                    className="w-64 h-64"
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem do QR Code');
                      e.target.style.display = 'none';
                      // Você pode adicionar um fallback aqui se quiser
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-200 rounded-lg">
                    <QrCode className="w-16 h-16 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-semibold">QR Code não disponível</p>
                    <p className="text-gray-500 text-xs mt-2 px-4">
                      Use a chave Copia e Cola abaixo para fazer o pagamento
                    </p>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-4">Escaneie o QR Code com o app do seu banco</p>
            </div>

            {/* Chave Copia e Cola */}
            <div className="bg-gray-700/50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Chave Pix Copia e Cola</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixData.copyPaste || 'Aguardando resposta da API...'}
                    readOnly
                    className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm font-mono break-all"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(pixData.copyPaste)}
                    disabled={!pixData.copyPaste || pixData.copyPaste === 'N/A'}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                {pixData.copyPaste && pixData.copyPaste !== 'N/A' && (
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Chave disponível! Clique no botão ao lado para copiar.
                  </p>
                )}
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
                <div>
                  <p className="text-gray-400 text-sm">Valor cobrado</p>
                  <p className="text-white font-bold text-lg">R$ {pixData.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Você receberá</p>
                  <p className="text-green-400 font-bold text-lg">R$ {pixData.valorLiquido}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Taxa Elite Pay</p>
                  <p className="text-white text-sm">R$ {pixData.taxas.elitePay}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Taxa Processamento</p>
                  <p className="text-white text-sm">R$ {pixData.taxas.api}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Status: <span className="font-semibold">Aguardando pagamento</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">O saldo será creditado automaticamente após confirmação</p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPixData(null)} className="flex-1">
                Gerar Novo
              </Button>
              <Button onClick={onBack} className="flex-1">
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Transferir/Saque Page
const TransferirPage = ({ token, user, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    pixKeyType: 'EMAIL',
    pixKey: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const pixKeyTypes = [
    { value: 'EMAIL', label: 'Email' },
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'TELEFONE', label: 'Telefone' },
    { value: 'CHAVE_ALEATORIA', label: 'Chave Aleatória' }
  ];

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount);
    
    if (amount < 10) {
      setToast({ message: 'Valor mínimo: R$ 10,00', type: 'error' });
      return;
    }

    const totalCost = amount + 1; // + taxa de R$1
    if (user.saldoCents < totalCost * 100) {
      setToast({ message: 'Saldo insuficiente', type: 'error' });
      return;
    }

    setShowConfirm(true);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    try {
      await api.withdraw(
        token,
        parseFloat(formData.amount),
        formData.pixKey,
        formData.pixKeyType,
        formData.description || 'Saque Elite Pay'
      );

      setToast({ message: 'Transferência realizada com sucesso!', type: 'success' });
      setShowConfirm(false);
      setFormData({ pixKeyType: 'EMAIL', pixKey: '', amount: '', description: '' });
      
      setTimeout(() => {
        onSuccess?.();
        onBack();
      }, 2000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const amount = parseFloat(formData.amount) || 0;
  const fee = 1.00;
  const total = amount + fee;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
        ← Voltar ao Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ArrowUpRight className="text-red-400" />
          Transferir / Saque
        </h1>
        <p className="text-gray-400">Transfira para qualquer chave PIX</p>
      </div>

      <Card className="p-8">
        <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="text-purple-400 w-8 h-8" />
            <div>
              <p className="text-gray-400 text-sm">Saldo disponível</p>
              <p className="text-2xl font-bold text-white">
                {(user.saldoCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Select
            label="Tipo de Chave PIX"
            value={formData.pixKeyType}
            onChange={(e) => setFormData(prev => ({ ...prev, pixKeyType: e.target.value }))}
            options={pixKeyTypes}
            required
          />

          <Input
            label="Chave PIX"
            value={formData.pixKey}
            onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
            placeholder={
              formData.pixKeyType === 'EMAIL' ? 'exemplo@email.com' :
              formData.pixKeyType === 'CPF' ? '123.456.789-00' :
              formData.pixKeyType === 'CNPJ' ? '12.345.678/0001-00' :
              formData.pixKeyType === 'TELEFONE' ? '(11) 98765-4321' :
              'Chave aleatória'
            }
            required
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="10"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0,00"
            required
          />

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Pagamento de aluguel"
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {amount > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Valor da transferência:</span>
                <span className="font-semibold">R$ {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Taxa de processamento:</span>
                <span className="font-semibold">R$ {fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-600">
                <span>Total a ser debitado:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!formData.pixKey || !formData.amount} className="w-full">
            <ArrowUpRight className="w-5 h-5" />
            Continuar
          </Button>
        </div>
      </Card>

      {/* Modal de Confirmação */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirmar Transferência">
        <div className="space-y-4">
          <p className="text-gray-300">Confirme os dados da transferência:</p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Chave PIX:</span>
              <span className="text-white font-semibold">{formData.pixKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo:</span>
              <span className="text-white">{pixKeyTypes.find(t => t.value === formData.pixKeyType)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valor:</span>
              <span className="text-white font-semibold">R$ {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taxa:</span>
              <span className="text-white">R$ {fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-600">
              <span className="text-white font-bold">Total:</span>
              <span className="text-white font-bold">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              ⚠️ Esta operação não pode ser desfeita. Confirme os dados antes de prosseguir.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={confirmTransfer} disabled={loading} variant="success" className="flex-1">
              {loading ? 'Processando...' : 'Confirmar Transferência'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Transações Page
const TransacoesPage = ({ token, onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tipo: '', status: '' });
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions(token);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter(tx => {
    if (filters.tipo && tx.tipo !== filters.tipo) return false;
    if (filters.status && tx.status !== filters.status) return false;
    return true;
  });

  const StatusBadge = ({ status }) => {
    const colors = {
      aprovado: 'bg-green-600/20 text-green-400 border-green-600/30',
      pendente: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
      cancelado: 'bg-red-600/20 text-red-400 border-red-600/30'
    };

    const icons = {
      aprovado: <Check className="w-3 h-3" />,
      pendente: <Clock className="w-3 h-3" />,
      cancelado: <X className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
        ← Voltar ao Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-purple-400" />
            Transações
          </h1>
          <p className="text-gray-400">Histórico completo de operações</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Tipo</label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3"
            >
              <option value="">Todos</option>
              <option value="deposito">Depósitos</option>
              <option value="saque">Saques</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3"
            >
              <option value="">Todos</option>
              <option value="aprovado">Aprovados</option>
              <option value="pendente">Pendentes</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" onClick={loadTransactions} className="w-full">
              <Filter className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {filteredTx.length} de {transactions.length} transações
        </div>
      </Card>

      {/* Lista de Transações */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            Carregando transações...
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma transação encontrada</p>
            <p className="text-gray-500 text-sm mt-2">Suas transações aparecerão aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredTx.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-6 hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${tx.tipo === 'deposito' ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                      {tx.tipo === 'deposito' ? (
                        <ArrowDownLeft className="text-green-400 w-6 h-6" />
                      ) : (
                        <ArrowUpRight className="text-red-400 w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold capitalize">{tx.tipo}</p>
                      <p className="text-gray-400 text-sm">{tx.descricao || 'Sem descrição'}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(tx.criadoEm).toLocaleString('pt-BR')} • {tx.metodo}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-bold text-lg">R$ {tx.valorLiquido}</p>
                    <p className="text-gray-400 text-sm">Bruto: R$ {tx.valorBruto}</p>
                    <div className="mt-2">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Detalhes */}
      <Modal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} title="Detalhes da Transação">
        {selectedTx && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-700">
              <span className="text-gray-400">Status</span>
              <StatusBadge status={selectedTx.status} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono text-sm">{selectedTx.id.slice(0, 8)}...</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white capitalize">{selectedTx.tipo}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Método:</span>
                <span className="text-white">{selectedTx.metodo}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Valor Bruto:</span>
                <span className="text-white font-semibold">R$ {selectedTx.valorBruto}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Taxa Elite Pay:</span>
                <span className="text-white">R$ {selectedTx.taxaMinha}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Taxa Processamento:</span>
                <span className="text-white">R$ {selectedTx.taxaApi}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-700">
                <span className="text-white font-bold">Valor Líquido:</span>
                <span className="text-purple-400 font-bold">R$ {selectedTx.valorLiquido}</span>
              </div>

              {selectedTx.chavePix && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Chave PIX:</span>
                  <span className="text-white">{selectedTx.chavePix}</span>
                </div>
              )}

              {selectedTx.qrcodeUrl && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">QR Code:</p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={selectedTx.qrcodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-700">
                <span className="text-gray-400 text-sm">Data:</span>
                <p className="text-white">{new Date(selectedTx.criadoEm).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// API Page - Menu Principal
const ApiPage = ({ token, onBack }) => {
  const [currentView, setCurrentView] = useState('menu');

  console.log('🎯 ApiPage renderizado, currentView:', currentView);

  if (currentView === 'credentials') {
    console.log('✅ Vai renderizar ApiCredentialsPage');
    return <ApiCredentialsPage token={token} onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'docs') {
    console.log('✅ Vai renderizar ApiDocsPage');
    return <ApiDocsPage token={token} onBack={() => setCurrentView('menu')} />;
  }

  console.log('📋 Renderizando menu principal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
          ← Voltar ao Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Shield className="text-purple-400" />
            API Elite Pay
          </h1>
          <p className="text-gray-400">Gerencie suas credenciais e acesse a documentação da API</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Credenciais */}
          <Card className="p-8 hover:border-purple-500/50 transition-all">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-purple-500/20 p-6 rounded-2xl">
                <Shield className="w-12 h-12 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Credenciais</h2>
                <p className="text-gray-400">
                  Gere e gerencie suas credenciais de API (Client ID e Client Secret)
                </p>
              </div>
              <Button 
                onClick={() => {
                  console.log('🔘 Botão Credenciais clicado!');
                  setCurrentView('credentials');
                }} 
                className="w-full mt-4"
              >
                Acessar Credenciais →
              </Button>
            </div>
          </Card>

          {/* Documentação */}
          <Card className="p-8 hover:border-purple-500/50 transition-all">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-500/20 p-6 rounded-2xl">
                <TrendingUp className="w-12 h-12 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Documentação</h2>
                <p className="text-gray-400">
                  Aprenda como integrar a API Elite Pay em sua aplicação
                </p>
              </div>
              <Button 
                onClick={() => {
                  console.log('🔘 Botão Documentação clicado!');
                  setCurrentView('docs');
                }} 
                variant="secondary" 
                className="w-full mt-4"
              >
                Ver Documentação →
              </Button>
            </div>
          </Card>
        </div>

        {/* Info */}
        <Card className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Segurança em Primeiro Lugar</h3>
              <p className="text-gray-300 text-sm">
                Suas credenciais de API são confidenciais. Nunca compartilhe seu Client Secret com terceiros e armazene-as de forma segura.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// API Credentials Page
const ApiCredentialsPage = ({ token, onBack }) => {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState(null);
  const [ips, setIps] = useState([]);
  const [newIp, setNewIp] = useState('');

  useEffect(() => {
    loadCredentials();
    loadIps();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credentials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCredentials(data);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIps = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credentials/ips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIps(data.ips || []);
    } catch (error) {
      console.error('Erro ao carregar IPs:', error);
    }
  };

  const handleGenerateCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/credentials/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setCredentials({
        hasCredentials: true,
        clientId: data.clientId,
        clientSecret: data.clientSecret
      });
      setToast({ message: 'Credenciais geradas com sucesso!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredentials = async () => {
    if (!confirm('Tem certeza que deseja deletar suas credenciais? Isso não pode ser desfeito.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/credentials`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erro ao deletar credenciais');
      
      setCredentials({ hasCredentials: false });
      setIps([]);
      setToast({ message: 'Credenciais deletadas com sucesso!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIp = async () => {
    if (!newIp) return;
    
    try {
      const response = await fetch(`${API_URL}/api/credentials/ips`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: newIp })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setIps([...ips, { id: data.id, ip_address: data.ip, criado_em: new Date().toISOString() }]);
      setNewIp('');
      setToast({ message: 'IP adicionado com sucesso!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleDeleteIp = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/credentials/ips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erro ao deletar IP');
      
      setIps(ips.filter(ip => ip.id !== id));
      setToast({ message: 'IP removido com sucesso!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copiado para área de transferência!', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
          ← Voltar
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Credenciais</h1>
          <p className="text-gray-400">Gerencie suas credenciais de API e configure IPs autorizados.</p>
        </div>

        {/* Alert de Segurança */}
        <Card className="p-4 bg-purple-500/10 border-purple-500/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-purple-400 font-semibold mb-1">Importante</p>
              <p className="text-sm text-gray-300">
                Suas credenciais de API são confidenciais. Não compartilhe com terceiros e armazene-as de forma segura.
              </p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando...</p>
          </div>
        ) : !credentials?.hasCredentials ? (
          /* Sem Credenciais */
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6">
              <Shield className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Nenhuma Credencial Gerada</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Você ainda não possui credenciais de API. Gere suas credenciais para começar a integrar com a Elite Pay.
            </p>
            <Button onClick={handleGenerateCredentials} disabled={loading} className="mx-auto">
              <Shield className="w-5 h-5" />
              Gerar Credenciais
            </Button>
          </Card>
        ) : (
          /* Com Credenciais */
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Suas Credenciais</h2>
                <Button variant="secondary" onClick={handleDeleteCredentials} className="text-red-400 hover:bg-red-500/10">
                  <X className="w-4 h-4" />
                  Deletar
                </Button>
              </div>

              <div className="space-y-4">
                {/* Client ID */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Client ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={credentials.clientId}
                      readOnly
                      className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm"
                    />
                    <Button variant="secondary" onClick={() => copyToClipboard(credentials.clientId)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Client Secret */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Client Secret</label>
                  <div className="flex gap-2">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={credentials.clientSecret}
                      readOnly
                      className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm"
                    />
                    <Button variant="secondary" onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button variant="secondary" onClick={() => copyToClipboard(credentials.clientSecret)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {showSecret ? 'Clique no ícone para ocultar' : 'Clique no ícone para revelar'}
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Criado em: {new Date(credentials.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </Card>

            {/* IPs Autorizados */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">IPs Autorizados para Saques</h2>
              <p className="text-gray-400 text-sm mb-6">
                Adicione IPs autorizados para aumentar a segurança da sua integração. Apenas requisições destes IPs poderão realizar saques via API.
              </p>

              {/* Adicionar IP */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Digite o IP (ex: 192.168.1.1)"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3"
                />
                <Button onClick={handleAddIp} disabled={!newIp}>
                  Adicionar IP
                </Button>
              </div>

              {/* Lista de IPs */}
              {ips.length === 0 ? (
                <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                  <p className="text-gray-500">Nenhum IP autorizado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ips.map(ip => (
                    <div key={ip.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div>
                        <p className="text-white font-mono">{ip.ip_address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Adicionado em {new Date(ip.criado_em).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button variant="secondary" onClick={() => handleDeleteIp(ip.id)} className="text-red-400 hover:bg-red-500/10">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

// API Documentation Page - Elite Pay
const ApiDocsPage = ({ token, onBack }) => {
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', label: 'Introdução' },
    { id: 'auth', label: 'Autenticação' },
    { id: 'deposit', label: 'Criar Depósito (Cash-In)' },
    { id: 'withdraw', label: 'Criar Saque (Cash-Out)' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'errors', label: 'Códigos de Erro' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 mb-6">
          ← Voltar ao Dashboard
        </button>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="md:col-span-1">
            <Card className="p-4 sticky top-6">
              <h3 className="text-white font-bold mb-4">Documentação</h3>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      activeSection === section.id
                        ? 'bg-purple-500/20 text-purple-400 font-medium border-l-2 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="md:col-span-3 space-y-6">
            
            {/* INTRODUÇÃO */}
            {activeSection === 'intro' && (
              <Card className="p-8 border-t-4 border-t-purple-500">
                <h1 className="text-3xl font-bold text-white mb-4">API Elite Pay</h1>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Bem-vindo à documentação de integração da <strong>Elite Pay</strong>. Nossa API RESTful permite que você gerencie recebimentos e transferências via PIX de forma simples, segura e escalável para o seu negócio.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <h3 className="text-blue-400 font-semibold uppercase text-xs tracking-wider">Base URL</h3>
                  </div>
                  <code className="text-white bg-gray-900 px-4 py-3 rounded block font-mono shadow-inner">
                    https://api.elitepay.com
                  </code>
                </div>

                <h2 className="text-xl font-bold text-white mb-4 mt-8">Recursos Principais</h2>
                <div className="grid gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                        <ArrowDownLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-white block mb-1">Cash-In (Depósitos)</strong>
                        <p className="text-sm text-gray-400">Gere QR Codes dinâmicos e códigos "Copia e Cola" instantâneos para seus clientes.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-white block mb-1">Cash-Out (Saques)</strong>
                        <p className="text-sm text-gray-400">Realize transferências automáticas para qualquer chave PIX via API.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* AUTENTICAÇÃO */}
            {activeSection === 'auth' && (
              <Card className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Autenticação</h1>
                <p className="text-gray-300 mb-6">
                  A API Elite Pay utiliza headers personalizados para autenticação. Todas as requisições devem conter as suas credenciais de produção.
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 flex gap-3">
                  <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                  <p className="text-yellow-200 text-sm">
                    <strong>Segurança:</strong> Nunca exponha seu <code>x-client-secret</code> no frontend (navegador ou aplicativos móveis). As chamadas devem ser feitas sempre servidor-para-servidor.
                  </p>
                </div>

                <h2 className="text-xl font-bold text-white mb-3">Headers Obrigatórios</h2>
                <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
                  <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <pre className="text-sm text-blue-300 font-mono">
{`{
   "curl -X GET https://api.elitepay.com/api/users/balance \"
   "-H "ci: seu_client_id" \"
   "-H "cs: seu_client_secret" \"
   "-H "Content-Type: application/json"
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            )}

            {/* CASH-IN (DEPÓSITO) */}
            {activeSection === 'deposit' && (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-white">Cash-In (Depósito)</h1>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">PIX</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Crie uma transação de entrada para receber pagamentos. O retorno conterá o QR Code e o código Copia e Cola.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      Endpoint <span className="text-xs font-normal text-gray-500">(POST)</span>
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 font-mono text-sm text-gray-300">
                      <span className="text-green-400 font-bold">POST</span> https://api.elitepay.com/v1/transactions/create
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Parâmetros (Body)</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-700">
                      <table className="w-full text-sm text-left text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">Campo</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Obrigatório</th>
                            <th className="px-4 py-3">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">amount</td>
                            <td className="px-4 py-3">number</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">Valor da transação (Ex: 50.00)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">payerName</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">Nome do pagador</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">payerDocument</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">CPF do pagador (apenas números)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">projectWebhook</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-red-400">Não</td>
                            <td className="px-4 py-3">URL do webhook do projeto</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">splitUser</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-red-400">Não</td>
                            <td className="px-4 py-3">Email do usuário na plataforma que receberá a divisão</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">splitTax</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-red-400">Não</td>
                            <td className="px-4 py-3">Porcentagem da taxa de divisão</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">description</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">Descrição do pagamento que irá aparecer na transação</td> 
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">TransactionID</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">ID único do seu sistema</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Request Exemplo</h3>
                      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 h-full">
                        <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
{`{
  curl -X POST https://api.elitepay.com/api/transactions/create \
  -H "ci: seu_client_id" \
  -H "cs: seu_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "payerName": "João Silva",
    "payerDocument": "123.456.789-00",
    "transactionId": "1234-5678-90",
    "projectWebhook": "https://seusite.com/webhook",
    "splitUser": "usuario@gmail.com",
    "splitTax": "10",
    "description": "Pagamento de produto #12345"
  }'
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Response (200 OK)</h3>
                      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 h-full">
                        <pre className="text-xs text-green-300 font-mono overflow-x-auto">
{`{
  "transactionId": "a57ed7b2-f8d3-49a8-83f4-b66208e46a46",
  "payer": {
    "name": "João Silva",
    "document": "123.456.789-00"
  }
  "transactionFee": 0.50,
  "transactionType": "DEPOSITO",
  "transactionMethod": "PIX",
  "transactionAmount": 10,
  "transactionState": "PENDENTE",
  "qrcodeUrl": "base64:qrcode",
  "copyPaste": "a57ed7b2-f8d3-49a8-83f4-b66208e46a46"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* CASH-OUT (SAQUE) */}
            {activeSection === 'withdraw' && (
              <Card className="p-8">
                 <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-white">Cash-Out (Transferência)</h1>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30">PIX</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Realize transferências de saldo da sua conta Elite Pay para qualquer chave PIX.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      Endpoint <span className="text-xs font-normal text-gray-500">(POST)</span>
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 font-mono text-sm text-gray-300">
                      <span className="text-orange-400 font-bold">POST</span> https://api.elitepay.com/v1/transactions/withdraw
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Parâmetros (Body)</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-700">
                       <table className="w-full text-sm text-left text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">Campo</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Obrigatório</th>
                            <th className="px-4 py-3">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">amount</td>
                            <td className="px-4 py-3">number</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">Valor do saque</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">pixKey</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">Chave PIX destino</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-400">pixKeyType</td>
                            <td className="px-4 py-3">string</td>
                            <td className="px-4 py-3 text-green-400">Sim</td>
                            <td className="px-4 py-3">CPF, CNPJ, EMAIL, PHONE ou EVP</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                   <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Request Exemplo</h3>
                      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 h-full">
                        <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
{`{
  curl -X POST https://api.elitepay.com/api/transactions/withdraw \
  -H "ci: seu_client_id" \
  -H "cs: seu_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "pixKey": "123.456.789-00",
    "pixKeyType": "CPF",
    "projectWebhook": "https://seusite.com/webhook",
    "description": "Transferência para João"
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Response (201 Created)</h3>
                      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 h-full">
                        <pre className="text-xs text-green-300 font-mono overflow-x-auto">
{`{
  {
  "transactionId": "f8820d9b-dacb-47ff-b26b-5ad05af93f4a",
  "transactionFee": 0.50,
  "transactionType": "RETIRADA",
  "transactionMethod": "PIX",
  "transactionAmount": 10,
  "transactionState": "COMPLETO"
}
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* WEBHOOKS */}
            {activeSection === 'webhooks' && (
              <Card className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Webhooks</h1>
                <p className="text-gray-300 mb-6">
                  Configure uma URL de retorno para receber notificações em tempo real sempre que o status de uma transação mudar (ex: quando um PIX é pago).
                </p>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
                  <h3 className="text-purple-400 font-semibold mb-2">Eventos Suportados</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <code>transaction.updated</code> - Status da transação alterado
                    </li>
                  </ul>
                </div>

                <h3 className="text-white font-semibold mb-3">Payload Enviado (POST)</h3>
                <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
{`{
  "event": "transaction.updated",
  "data": {
    "transactionId": "ep_88a7b2-f8d3-49a8",
    "externalId": "ped_998877",
    "status": "PAID",
    "amount": 50.00,
    "paidAt": "2025-11-17T10:35:00Z"
  }
}`}
                  </pre>
                </div>
              </Card>
            )}

            {/* ERROS */}
            {activeSection === 'errors' && (
              <Card className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Códigos de Erro</h1>
                <p className="text-gray-300 mb-6">
                  Padrões de erro que você pode encontrar ao integrar com a Elite Pay.
                </p>

                <div className="space-y-4">
                  {[
                    { code: 400, title: 'Bad Request', desc: 'Parâmetros inválidos ou faltando campos obrigatórios.' },
                    { code: 401, title: 'Unauthorized', desc: 'Client ID ou Secret incorretos.' },
                    { code: 402, title: 'Payment Required', desc: 'Saldo insuficiente para realizar o saque.' },
                    { code: 403, title: 'Forbidden', desc: 'Sua conta está bloqueada ou IP não autorizado.' },
                    { code: 404, title: 'Not Found', desc: 'Transação ou recurso não encontrado.' },
                    { code: 500, title: 'Internal Error', desc: 'Erro interno nos servidores da Elite Pay.' }
                  ].map(error => (
                    <div key={error.code} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-start gap-4">
                      <span className={`px-3 py-1 rounded font-mono text-sm font-bold mt-1 ${
                        error.code >= 500 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {error.code}
                      </span>
                      <div>
                        <span className="text-white font-bold block">{error.title}</span>
                        <p className="text-gray-400 text-sm">{error.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Sales Chart Component
const SalesChart = ({ period, token }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [period]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/transactions?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        const transactions = data.transactions.filter(tx => tx.tipo === 'deposito' && tx.status === 'aprovado');
        const grouped = groupTransactionsByPeriod(transactions, period);
        setChartData(grouped);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupTransactionsByPeriod = (transactions, period) => {
    const now = new Date();
    const groups = {};

    let labels = [];
    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        labels.push(key);
        groups[key] = 0;
      }
    } else if (period === 'month') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      weeks.forEach(week => {
        labels.push(week);
        groups[week] = 0;
      });
    } else {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.forEach(month => {
        labels.push(month);
        groups[month] = 0;
      });
    }

    transactions.forEach(tx => {
      const date = new Date(tx.criadoEm);
      let key;

      if (period === 'week') {
        key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      } else if (period === 'month') {
        const day = date.getDate();
        if (day <= 7) key = 'Sem 1';
        else if (day <= 14) key = 'Sem 2';
        else if (day <= 21) key = 'Sem 3';
        else key = 'Sem 4';
      } else {
        key = date.toLocaleDateString('pt-BR', { month: 'short' });
        key = key.charAt(0).toUpperCase() + key.slice(1);
      }

      if (groups[key] !== undefined) {
        groups[key] += parseFloat(tx.valorLiquido);
      }
    });

    return labels.map(label => ({
      label,
      value: groups[label]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Carregando dados...</p>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 flex flex-col justify-between py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-gray-800/50 w-full" />
        ))}
      </div>

      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
        <span>R$ {maxValue.toFixed(0)}</span>
        <span>R$ {(maxValue * 0.75).toFixed(0)}</span>
        <span>R$ {(maxValue * 0.5).toFixed(0)}</span>
        <span>R$ {(maxValue * 0.25).toFixed(0)}</span>
        <span>R$ 0</span>
      </div>

      <div className="ml-16 h-full flex items-end justify-around gap-2 pb-8">
        {chartData.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-500 hover:to-purple-300 cursor-pointer"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-gray-700">
                    <div className="font-bold">R$ {item.value.toFixed(2)}</div>
                    <div className="text-gray-400">{item.label}</div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-2 right-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
        <p className="text-xs text-purple-400">Total do período</p>
        <p className="text-lg font-bold text-white">R$ {totalValue.toFixed(2)}</p>
      </div>
    </div>
  );
};

// Dashboard com Abas
const Dashboard = ({ user, onLogout, onRefresh }) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartPeriod, setChartPeriod] = useState('month');

  const token = localStorage.getItem('token');

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    onRefresh?.();
  };

  const saldo = user.saldoCents / 100;

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Shield },
    { id: 'receber', label: 'Receber PIX', icon: ArrowDownLeft },
    { id: 'transferir', label: 'Transferir', icon: ArrowUpRight },
    { id: 'transacoes', label: 'Transações', icon: TrendingUp },
    { id: 'api', label: 'API', icon: Shield }
  ];

  if (currentTab === 'receber') {
    return <ReceberPixPage token={token} onBack={() => { setCurrentTab('home'); handleRefresh(); }} />;
  }

  if (currentTab === 'transferir') {
    return <TransferirPage token={token} user={user} onBack={() => { setCurrentTab('home'); handleRefresh(); }} onSuccess={handleRefresh} />;
  }

  if (currentTab === 'transacoes') {
    return <TransacoesPage key={refreshKey} token={token} onBack={() => setCurrentTab('home')} />;
  }

  if (currentTab === 'api') {
    return <ApiPage token={token} onBack={() => setCurrentTab('home')} />;
  }

  const stats = [
    {
      title: 'Saldo Disponível',
      value: saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: DollarSign,
      color: 'bg-purple-600/20 text-purple-400'
    },
    {
      title: 'Transações',
      value: '0',
      icon: TrendingUp,
      color: 'bg-green-600/20 text-green-400'
    },
    {
      title: 'Total Recebido',
      value: 'R$ 0,00',
      icon: ArrowDownLeft,
      color: 'bg-blue-600/20 text-blue-400'
    },
    {
      title: 'Total Sacado',
      value: 'R$ 0,00',
      icon: ArrowUpRight,
      color: 'bg-red-600/20 text-red-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-white font-semibold">{user.nome}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            <Button variant="secondary" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {user.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">Gerencie seus pagamentos e transações</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Análise de Vendas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Análise de Vendas</h2>
              <p className="text-gray-400 text-sm">Visualize o desempenho das suas transações</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('week')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  chartPeriod === 'week'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setChartPeriod('month')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  chartPeriod === 'month'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setChartPeriod('year')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  chartPeriod === 'year'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Ano
              </button>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-64 relative">
            <SalesChart period={chartPeriod} token={token} />
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Plataforma Elite Pay</h3>
              <p className="text-gray-300 mb-4">
                Sistema de pagamentos completo com integração PIX. Receba pagamentos com QR Code e faça saques instantâneos.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-400 font-semibold">Taxa de Depósito</p>
                  <p className="text-white">4% + R$ 1,00</p>
                </div>
                <div>
                  <p className="text-purple-400 font-semibold">Taxa de Saque</p>
                  <p className="text-white">R$ 1,00</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>Elite Pay ©️ 2024 • Versão 1.0.0 • Plataforma Completa</p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const profile = await api.getProfile(token);
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterPage onBack={() => setShowRegister(false)} onSuccess={handleLogin} />;
    }
    return <LoginPage onLogin={handleLogin} onRegister={() => setShowRegister(true)} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onRefresh={handleRefresh} />;
}

export default App;