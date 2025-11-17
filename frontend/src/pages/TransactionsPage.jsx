// ==========================================
// src/pages/TransactionsPage.jsx
// ==========================================
import React, { useState, useEffect } from ‘react’;
import { transactionService } from ‘../services/api’;
import { Card, Table, StatusBadge, LoadingSpinner, EmptyState, Select } from ‘../components’;
import { ArrowUpRight, ArrowDownLeft, Filter, Download, Search } from ‘lucide-react’;

const TransactionsPage = () => {
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
tipo: ‘todos’,
status: ‘todos’,
search: ‘’
});
const [selectedTx, setSelectedTx] = useState(null);

useEffect(() => {
loadTransactions();
}, []);

const loadTransactions = async () => {
setLoading(true);
try {
const { data } = await transactionService.list();
setTransactions(data.transactions || []);
} catch (error) {
console.error(‘Erro ao carregar transações:’, error);
} finally {
setLoading(false);
}
};

const filteredTransactions = transactions.filter(tx => {
if (filters.tipo !== ‘todos’ && tx.tipo !== filters.tipo) return false;
if (filters.status !== ‘todos’ && tx.status !== filters.status) return false;
if (filters.search && !tx.id.toLowerCase().includes(filters.search.toLowerCase()) &&
!tx.descricao?.toLowerCase().includes(filters.search.toLowerCase())) return false;
return true;
});

const columns = [
{
header: ‘Tipo’,
field: ‘tipo’,
render: (tx) => (
<div className="flex items-center gap-2">
{tx.tipo === ‘deposito’ ? (
<div className="bg-green-600/20 p-2 rounded-lg">
<ArrowDownLeft className="text-green-400 w-4 h-4" />
</div>
) : (
<div className="bg-red-600/20 p-2 rounded-lg">
<ArrowUpRight className="text-red-400 w-4 h-4" />
</div>
)}
<span className="capitalize">{tx.tipo}</span>
</div>
)
},
{
header: ‘ID’,
field: ‘id’,
render: (tx) => (
<span className="font-mono text-xs text-gray-400">
{tx.id.slice(0, 8)}…
</span>
)
},
{
header: ‘Descrição’,
field: ‘descricao’,
render: (tx) => (
<span className="text-gray-300">{tx.descricao || ‘-’}</span>
)
},
{
header: ‘Valor Bruto’,
field: ‘valorBruto’,
render: (tx) => (
<span className="font-semibold">{tx.valorBruto}</span>
)
},
{
header: ‘Valor Líquido’,
field: ‘valorLiquido’,
render: (tx) => (
<span className="font-bold text-purple-400">{tx.valorLiquido}</span>
)
},
{
header: ‘Status’,
field: ‘status’,
render: (tx) => <StatusBadge status={tx.status} />
},
{
header: ‘Data’,
field: ‘criadoEm’,
render: (tx) => {
const date = new Date(tx.criadoEm);
return (
<div className="text-sm">
<div className="text-white">{date.toLocaleDateString(‘pt-BR’)}</div>
<div className="text-gray-400 text-xs">{date.toLocaleTimeString(‘pt-BR’)}</div>
</div>
);
}
}
];

const exportToCSV = () => {
const headers = [‘ID’, ‘Tipo’, ‘Valor Bruto’, ‘Valor Líquido’, ‘Status’, ‘Data’];
const rows = filteredTransactions.map(tx => [
tx.id,
tx.tipo,
tx.valorBruto,
tx.valorLiquido,
tx.status,
new Date(tx.criadoEm).toLocaleString(‘pt-BR’)
]);

```
const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `transacoes-${Date.now()}.csv`;
a.click();
```

};

if (loading) {
return <LoadingSpinner text="Carregando transações..." />;
}

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-white">Transações</h1>
<p className="text-gray-400">Histórico completo de operações</p>
</div>
<button
onClick={exportToCSV}
className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
>
<Download className="w-4 h-4" />
Exportar CSV
</button>
</div>

```
  {/* Filters */}
  <Card className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por ID ou descrição..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <Select
        label=""
        value={filters.tipo}
        onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
        options={[
          { value: 'todos', label: 'Todos os tipos' },
          { value: 'deposito', label: 'Depósitos' },
          { value: 'saque', label: 'Saques' }
        ]}
      />

      <Select
        label=""
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        options={[
          { value: 'todos', label: 'Todos os status' },
          { value: 'aprovado', label: 'Aprovados' },
          { value: 'pendente', label: 'Pendentes' },
          { value: 'cancelado', label: 'Cancelados' }
        ]}
      />
    </div>

    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
      <span className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        {filteredTransactions.length} de {transactions.length} transações
      </span>
    </div>
  </Card>

  {/* Table */}
  <Card className="overflow-hidden">
    {filteredTransactions.length === 0 ? (
      <EmptyState
        title="Nenhuma transação encontrada"
        description="Ajuste os filtros ou realize sua primeira transação"
      />
    ) : (
      <Table
        columns={columns}
        data={filteredTransactions}
        onRowClick={(tx) => setSelectedTx(tx)}
      />
    )}
  </Card>

  {/* Transaction Detail Modal */}
  {selectedTx && (
    <Modal
      isOpen={!!selectedTx}
      onClose={() => setSelectedTx(null)}
      title="Detalhes da Transação"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-700">
          <span className="text-gray-400">Status</span>
          <StatusBadge status={selectedTx.status} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">ID:</span>
            <span className="text-white font-mono text-sm">{selectedTx.id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Tipo:</span>
            <span className="text-white capitalize">{selectedTx.tipo}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Valor Bruto:</span>
            <span className="text-white font-semibold">{selectedTx.valorBruto}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Taxa Elite Pay:</span>
            <span className="text-white">{selectedTx.taxaMinha}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Taxa API:</span>
            <span className="text-white">{selectedTx.taxaApi}</span>
          </div>

          <div className="flex justify-between pt-3 border-t border-gray-700">
            <span className="text-white font-bold">Valor Líquido:</span>
            <span className="text-purple-400 font-bold">{selectedTx.valorLiquido}</span>
          </div>

          {selectedTx.chavePix && (
            <div className="flex justify-between">
              <span className="text-gray-400">Chave PIX:</span>
              <span className="text-white">{selectedTx.chavePix}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Data:</span>
            <span className="text-white">
              {new Date(selectedTx.criadoEm).toLocaleString('pt-BR')}
            </span>
          </div>

          {selectedTx.descricao && (
            <div className="pt-3 border-t border-gray-700">
              <span className="text-gray-400 block mb-1">Descrição:</span>
              <p className="text-white">{selectedTx.descricao}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )}
</div>
```

);
};

export default TransactionsPage;

// ==========================================
// src/pages/AdminPage.jsx
// ==========================================
import React, { useState, useEffect } from ‘react’;
import { adminService } from ‘../services/api’;
import { Card, Button, LoadingSpinner, Table, StatusBadge } from ‘../components’;
import {
DollarSign, Users, TrendingUp, Activity,
Download, RefreshCw, Shield, BarChart3
} from ‘lucide-react’;

const AdminPage = () => {
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

useEffect(() => {
loadStats();
}, []);

const loadStats = async () => {
setLoading(true);
try {
const { data } = await adminService.getStats();
setStats(data);
} catch (error) {
console.error(‘Erro ao carregar estatísticas:’, error);
} finally {
setLoading(false);
}
};

const handleRefresh = async () => {
setRefreshing(true);
await loadStats();
setRefreshing(false);
};

const handleBackup = () => {
adminService.downloadBackup();
};

if (loading) {
return <LoadingSpinner text="Carregando painel administrativo..." />;
}

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-white flex items-center gap-3">
<Shield className="text-purple-400" />
Painel Administrativo
</h1>
<p className="text-gray-400">Visão geral da plataforma</p>
</div>
<div className="flex gap-3">
<Button
variant="secondary"
onClick={handleRefresh}
disabled={refreshing}
>
<RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
Atualizar
</Button>
<Button onClick={handleBackup}>
<Download className="w-4 h-4 mr-2" />
Backup DB
</Button>
</div>
</div>

```
  {/* Central Balance */}
  <Card className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30">
    <h2 className="text-xl font-bold text-white mb-4">Saldo Central (Taxas da Plataforma)</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-purple-400 text-sm mb-1">Total em Taxas</p>
        <p className="text-4xl font-bold text-white">{stats?.centralBalance?.totalTaxas || 'R$ 0,00'}</p>
      </div>
      <div>
        <p className="text-green-400 text-sm mb-1">Total Depositado</p>
        <p className="text-4xl font-bold text-white">{stats?.centralBalance?.totalDepositos || 'R$ 0,00'}</p>
      </div>
      <div>
        <p className="text-red-400 text-sm mb-1">Total Sacado</p>
        <p className="text-4xl font-bold text-white">{stats?.centralBalance?.totalSaques || 'R$ 0,00'}</p>
      </div>
    </div>
  </Card>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">Total de Usuários</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-blue-600/20 p-3 rounded-lg">
          <Users className="text-blue-400" />
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">Transações Hoje</p>
          <p className="text-3xl font-bold text-white mt-2">
            {stats?.transactions?.filter(t => t.status === 'aprovado').length || 0}
          </p>
        </div>
        <div className="bg-green-600/20 p-3 rounded-lg">
          <Activity className="text-green-400" />
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">Volume Total</p>
          <p className="text-3xl font-bold text-white mt-2">
            {stats?.transactions?.reduce((acc, t) => {
              const value = parseFloat(t.totalBruto?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
              return acc + value;
            }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
          </p>
        </div>
        <div className="bg-purple-600/20 p-3 rounded-lg">
          <TrendingUp className="text-purple-400" />
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">Taxa Média</p>
          <p className="text-3xl font-bold text-white mt-2">4.0%</p>
        </div>
        <div className="bg-yellow-600/20 p-3 rounded-lg">
          <BarChart3 className="text-yellow-400" />
        </div>
      </div>
    </Card>
  </div>

  {/* Transactions by Status */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">Transações por Status</h3>
      <div className="space-y-3">
        {stats?.transactions?.map((tx, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusBadge status={tx.status} />
              <span className="text-white capitalize">{tx.tipo}</span>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{tx.count} transações</p>
              <p className="text-gray-400 text-sm">{tx.totalBruto}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">Receita por Tipo</h3>
      <div className="space-y-3">
        {stats?.transactions?.map((tx, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-semibold capitalize">{tx.tipo}</p>
              <p className="text-gray-400 text-sm">{tx.count} operações</p>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-bold">{tx.totalTaxasMinhas}</p>
              <p className="text-gray-400 text-xs">Taxa Elite Pay</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>

  {/* Recent Transactions */}
  <Card className="p-6">
    <h3 className="text-xl font-bold text-white mb-4">Transações Recentes</h3>
    {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
      <Table
        columns={[
          {
            header: 'ID',
            render: (tx) => <span className="font-mono text-xs">{tx.id.slice(0, 8)}...</span>
          },
          {
            header: 'Usuário',
            render: (tx) => (
              <div>
                <p className="text-white">{tx.userName}</p>
                <p className="text-gray-400 text-xs">{tx.userEmail}</p>
              </div>
            )
          },
          {
            header: 'Tipo',
            render: (tx) => <span className="capitalize">{tx.tipo}</span>
          },
          {
            header: 'Valor',
            render: (tx) => <span className="font-semibold">{tx.valorBruto}</span>
          },
          {
            header: 'Status',
            render: (tx) => <StatusBadge status={tx.status} />
          },
          {
            header: 'Data',
            render: (tx) => (
              <span className="text-sm">{new Date(tx.criadoEm).toLocaleString('pt-BR')}</span>
            )
          }
        ]}
        data={stats.recentTransactions}
      />
    ) : (
      <p className="text-gray-400 text-center py-8">Nenhuma transação recente</p>
    )}
  </Card>
</div>
```

);
};

export default AdminPage;