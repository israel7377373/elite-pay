// ==========================================
// src/services/api.js
// ==========================================
import axios from ‘axios’;

const API_BASE_URL = import.meta.env.VITE_API_URL || ‘https://elitepaybr.com
’;

const api = axios.create({
baseURL: API_BASE_URL,
timeout: 30000,
headers: {
‘Content-Type’: ‘application/json’
}
});

// Interceptor para adicionar token
api.interceptors.request.use(
(config) => {
const token = localStorage.getItem(‘token’);
if (token) {
config.headers.Authorization = `Bearer ${token}`;
}
return config;
},
(error) => Promise.reject(error)
);

// Interceptor para tratar erros
api.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
localStorage.removeItem(‘token’);
localStorage.removeItem(‘user’);
window.location.href = ‘/login’;
}
return Promise.reject(error);
}
);

// Auth
export const authService = {
register: (data) => api.post(’/api/auth/register’, data),
login: (data) => api.post(’/api/auth/login’, data),
getProfile: () => api.get(’/api/auth/me’),
logout: () => {
localStorage.removeItem(‘token’);
localStorage.removeItem(‘user’);
}
};

// Transactions
export const transactionService = {
create: (data) => api.post(’/api/transactions/create’, data),
withdraw: (data) => api.post(’/api/transactions/withdraw’, data),
list: (params) => api.get(’/api/transactions’, { params }),
getById: (id) => api.get(`/api/transactions/${id}`)
};

// Admin
export const adminService = {
getStats: () => api.get(’/api/admin/stats’),
getUsers: (params) => api.get(’/api/admin/users’, { params }),
getLogs: (params) => api.get(’/api/admin/logs’, { params }),
downloadBackup: () => {
const token = localStorage.getItem(‘token’);
window.open(`${API_BASE_URL}/api/admin/backup?token=${token}`, ‘_blank’);
}
};

export default api;

// ==========================================
// src/components/Modal.jsx
// ==========================================
import React from ‘react’;
import { X } from ‘lucide-react’;

const Modal = ({ isOpen, onClose, title, children, footer }) => {
if (!isOpen) return null;

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
<div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-purple-500/20">
<div className="flex items-center justify-between p-6 border-b border-gray-700">
<h3 className="text-xl font-bold text-white">{title}</h3>
<button
onClick={onClose}
className="text-gray-400 hover:text-white transition-colors"
>
<X className="w-5 h-5" />
</button>
</div>

```
    <div className="p-6">{children}</div>
    
    {footer && (
      <div className="flex gap-3 p-6 border-t border-gray-700">
        {footer}
      </div>
    )}
  </div>
</div>
```

);
};

export default Modal;

// ==========================================
// src/components/Select.jsx
// ==========================================
import React from ‘react’;

const Select = ({ label, value, onChange, options, required = false }) => {
return (
<div className="mb-4">
<label className="block text-gray-300 text-sm font-semibold mb-2">
{label} {required && <span className="text-red-400">*</span>}
</label>
<select
value={value}
onChange={onChange}
required={required}
className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
>
{options.map((option) => (
<option key={option.value} value={option.value}>
{option.label}
</option>
))}
</select>
</div>
);
};

export default Select;

// ==========================================
// src/components/StatusBadge.jsx
// ==========================================
import React from ‘react’;
import { CheckCircle, Clock, XCircle } from ‘lucide-react’;

const StatusBadge = ({ status }) => {
const statusConfig = {
aprovado: {
icon: CheckCircle,
text: ‘Aprovado’,
className: ‘bg-green-600/20 text-green-400 border-green-600/30’
},
pendente: {
icon: Clock,
text: ‘Pendente’,
className: ‘bg-yellow-600/20 text-yellow-400 border-yellow-600/30’
},
cancelado: {
icon: XCircle,
text: ‘Cancelado’,
className: ‘bg-red-600/20 text-red-400 border-red-600/30’
}
};

const config = statusConfig[status] || statusConfig.pendente;
const Icon = config.icon;

return (
<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
<Icon className="w-3 h-3" />
{config.text}
</span>
);
};

export default StatusBadge;

// ==========================================
// src/components/LoadingSpinner.jsx
// ==========================================
import React from ‘react’;

const LoadingSpinner = ({ size = ‘md’, text = ‘Carregando…’ }) => {
const sizes = {
sm: ‘w-4 h-4’,
md: ‘w-8 h-8’,
lg: ‘w-12 h-12’
};

return (
<div className="flex flex-col items-center justify-center p-8">
<div className={`${sizes[size]} border-4 border-purple-500 border-t-transparent rounded-full animate-spin`}></div>
{text && <p className="mt-4 text-gray-400">{text}</p>}
</div>
);
};

export default LoadingSpinner;

// ==========================================
// src/components/EmptyState.jsx
// ==========================================
import React from ‘react’;
import { Inbox } from ‘lucide-react’;

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
return (
<div className="flex flex-col items-center justify-center p-12 text-center">
<div className="bg-gray-700/50 p-6 rounded-full mb-4">
<Icon className="w-12 h-12 text-gray-400" />
</div>
<h3 className="text-xl font-bold text-white mb-2">{title}</h3>
{description && <p className="text-gray-400 mb-6">{description}</p>}
{action}
</div>
);
};

export default EmptyState;

// ==========================================
// src/components/Table.jsx
// ==========================================
import React from ‘react’;

const Table = ({ columns, data, onRowClick }) => {
return (
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="border-b border-gray-700">
{columns.map((column, index) => (
<th
key={index}
className="px-4 py-3 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider"
>
{column.header}
</th>
))}
</tr>
</thead>
<tbody className="divide-y divide-gray-700">
{data.map((row, rowIndex) => (
<tr
key={rowIndex}
onClick={() => onRowClick?.(row)}
className={onRowClick ? ‘cursor-pointer hover:bg-gray-700/50 transition-colors’ : ‘’}
>
{columns.map((column, colIndex) => (
<td key={colIndex} className="px-4 py-4 text-sm text-white">
{column.render ? column.render(row) : row[column.field]}
</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);
};

export default Table;

// ==========================================
// src/pages/Register.jsx
// ==========================================
import React, { useState } from ‘react’;
import { authService } from ‘../services/api’;
import { Card, Button, Input, Toast } from ‘../components’;

const Register = ({ onSuccess }) => {
const [formData, setFormData] = useState({
nome: ‘’,
cpf: ‘’,
telefone: ‘’,
email: ‘’,
senha: ‘’,
confirmarSenha: ‘’,
termsAccepted: false
});

const [loading, setLoading] = useState(false);
const [toast, setToast] = useState(null);

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData(prev => ({
…prev,
[name]: type === ‘checkbox’ ? checked : value
}));
};

const formatCPF = (value) => {
return value
.replace(/\D/g, ‘’)
.replace(/(\d{3})(\d)/, ‘$1.$2’)
.replace(/(\d{3})(\d)/, ‘$1.$2’)
.replace(/(\d{3})(\d{1,2})/, ‘$1-$2’)
.replace(/(-\d{2})\d+?$/, ‘$1’);
};

const formatPhone = (value) => {
return value
.replace(/\D/g, ‘’)
.replace(/(\d{2})(\d)/, ‘($1) $2’)
.replace(/(\d{4,5})(\d{4})/, ‘$1-$2’);
};

const handleSubmit = async () => {
if (formData.senha !== formData.confirmarSenha) {
setToast({ message: ‘As senhas não coincidem’, type: ‘error’ });
return;
}

```
if (!formData.termsAccepted) {
  setToast({ message: 'Você deve aceitar os termos de uso', type: 'error' });
  return;
}

setLoading(true);
try {
  const { data } = await authService.register(formData);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setToast({ message: 'Conta criada com sucesso!', type: 'success' });
  setTimeout(() => onSuccess(data), 1000);
} catch (error) {
  setToast({ 
    message: error.response?.data?.error || 'Erro ao criar conta', 
    type: 'error' 
  });
} finally {
  setLoading(false);
}
```

};

return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
{toast && <Toast {…toast} onClose={() => setToast(null)} />}

```
  <Card className="w-full max-w-2xl p-8">
    <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
    <p className="text-gray-400 mb-6">Preencha seus dados para começar</p>

    <div className="grid md:grid-cols-2 gap-4">
      <Input
        label="Nome Completo"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        placeholder="João Silva"
      />
      
      <Input
        label="CPF"
        name="cpf"
        value={formatCPF(formData.cpf)}
        onChange={handleChange}
        placeholder="123.456.789-00"
        maxLength={14}
      />
      
      <Input
        label="Telefone"
        name="telefone"
        value={formatPhone(formData.telefone)}
        onChange={handleChange}
        placeholder="(11) 98765-4321"
        maxLength={15}
      />
      
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="seu@email.com"
      />
      
      <Input
        label="Senha"
        type="password"
        name="senha"
        value={formData.senha}
        onChange={handleChange}
        placeholder="••••••••"
      />
      
      <Input
        label="Confirmar Senha"
        type="password"
        name="confirmarSenha"
        value={formData.confirmarSenha}
        onChange={handleChange}
        placeholder="••••••••"
      />
    </div>

    <div className="mt-6">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={formData.termsAccepted}
          onChange={handleChange}
          className="mt-1"
        />
        <span className="text-sm text-gray-400">
          Eu aceito os <a href="#" className="text-purple-400 hover:underline">termos de uso</a> e a <a href="#" className="text-purple-400 hover:underline">política de privacidade</a>
        </span>
      </label>
    </div>

    <Button
      onClick={handleSubmit}
      disabled={loading}
      className="w-full mt-6"
    >
      {loading ? 'Criando conta...' : 'Criar Conta'}
    </Button>

    <p className="text-center text-gray-400 mt-6">
      Já tem uma conta? <span className="text-purple-400 cursor-pointer hover:underline">Entrar</span>
    </p>
  </Card>
</div>
```

);
};

export default Register;

// ==========================================
// src/pages/TransferPage.jsx (Saque)
// ==========================================
import React, { useState } from ‘react’;
import { transactionService } from ‘../services/api’;
import { Card, Button, Input, Select, Modal, Toast } from ‘../components’;
import { ArrowUpRight, AlertCircle } from ‘lucide-react’;

const TransferPage = ({ user, onSuccess }) => {
const [formData, setFormData] = useState({
pixKeyType: ‘EMAIL’,
pixKey: ‘’,
amount: ‘’,
description: ‘’
});

const [showConfirm, setShowConfirm] = useState(false);
const [loading, setLoading] = useState(false);
const [toast, setToast] = useState(null);

const pixKeyTypes = [
{ value: ‘EMAIL’, label: ‘Email’ },
{ value: ‘CPF’, label: ‘CPF’ },
{ value: ‘TELEFONE’, label: ‘Telefone’ },
{ value: ‘CHAVE_ALEATORIA’, label: ‘Chave Aleatória’ }
];

const handleSubmit = () => {
const amountValue = parseFloat(formData.amount);

```
if (isNaN(amountValue) || amountValue < 10) {
  setToast({ message: 'Valor mínimo: R$ 10,00', type: 'error' });
  return;
}

const amountCents = Math.round(amountValue * 100);
const totalWithFee = amountCents + 100; // + R$1 taxa API

if (user.saldoCents < totalWithFee) {
  setToast({ message: 'Saldo insuficiente', type: 'error' });
  return;
}

setShowConfirm(true);
```

};

const confirmWithdraw = async () => {
setLoading(true);
try {
const amountCents = Math.round(parseFloat(formData.amount) * 100);

```
  await transactionService.withdraw({
    amountCents,
    pixKey: formData.pixKey,
    pixKeyType: formData.pixKeyType,
    description: formData.description || 'Saque Elite Pay'
  });

  setToast({ message: 'Saque realizado com sucesso!', type: 'success' });
  setShowConfirm(false);
  setFormData({ pixKeyType: 'EMAIL', pixKey: '', amount: '', description: '' });
  onSuccess?.();
} catch (error) {
  setToast({ 
    message: error.response?.data?.error || 'Erro ao processar saque', 
    type: 'error' 
  });
} finally {
  setLoading(false);
}
```

};

const amountValue = parseFloat(formData.amount) || 0;
const fee = 1.00;
const total = amountValue + fee;

return (
<div className="max-w-2xl mx-auto space-y-6">
{toast && <Toast {…toast} onClose={() => setToast(null)} />}

```
  <Card className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-red-600/20 p-3 rounded-lg">
        <ArrowUpRight className="text-red-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Sacar via PIX</h2>
        <p className="text-gray-400">Transfira para sua conta</p>
      </div>
    </div>

    <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-purple-400 mt-1" size={20} />
        <div>
          <p className="text-white font-semibold">Seu saldo disponível</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">
            {(user.saldoCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>

    <Select
      label="Tipo de Chave PIX"
      value={formData.pixKeyType}
      onChange={(e) => setFormData(prev => ({ ...prev, pixKeyType: e.target.value }))}
      options={pixKeyTypes}
    />

    <Input
      label="Chave PIX"
      value={formData.pixKey}
      onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
      placeholder={
        formData.pixKeyType === 'EMAIL' ? 'seu@email.com' :
        formData.pixKeyType === 'CPF' ? '123.456.789-00' :
        formData.pixKeyType === 'TELEFONE' ? '(11) 98765-4321' :
        'Chave aleatória'
      }
    />

    <Input
      label="Valor (R$)"
      type="number"
      step="0.01"
      value={formData.amount}
      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
      placeholder="100.00"
    />

    <Input
      label="Descrição (opcional)"
      value={formData.description}
      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      placeholder="Ex: Pagamento de aluguel"
    />

    {amountValue > 0 && (
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-gray-300">
          <span>Valor do saque:</span>
          <span className="font-semibold">R$ {amountValue.toFixed(2)}</span>
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

    <Button onClick={handleSubmit} className="w-full mt-6">
      Continuar
    </Button>
  </Card>

  <Modal
    isOpen={showConfirm}
    onClose={() => setShowConfirm(false)}
    title="Confirmar Saque"
    footer={
      <>
        <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={confirmWithdraw} disabled={loading} className="flex-1">
          {loading ? 'Processando...' : 'Confirmar'}
        </Button>
      </>
    }
  >
    <div className="space-y-4">
      <p className="text-gray-300">Confirme os detalhes do saque:</p>
      
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
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
          <span className="text-white font-semibold">R$ {amountValue.toFixed(2)}</span>
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

      <p className="text-sm text-gray-400">
        ⚠️ Esta operação não pode ser desfeita. O valor será transferido para a chave PIX informada.
      </p>
    </div>
  </Modal>
</div>
```

);
};

export default TransferPage;