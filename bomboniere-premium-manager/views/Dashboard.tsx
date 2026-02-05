import React, { useMemo } from 'react';
import { getClients, getTransactions } from '../services/storage';
import { getNextBillingWindowLabel } from '../utils/dateLogic';
import { Wallet, Calendar, TrendingUp, PiggyBank, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass} bg-opacity-20`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const clients = getClients();
  const transactions = getTransactions();

  const totalReceivable = useMemo(() => {
    return clients.reduce((acc, client) => acc + client.balance, 0);
  }, [clients]);

  const activeClients = useMemo(() => {
    return clients.filter(c => c.balance > 0).length;
  }, [clients]);

  const monthlySales = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && 
               tDate.getFullYear() === now.getFullYear() && 
               t.amount > 0; // Only positive amounts (Sales)
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const monthlyReceipts = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && 
               tDate.getFullYear() === now.getFullYear() && 
               t.amount < 0; // Only negative amounts (Payments)
      })
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Saldo a Receber" 
          value={`R$ ${totalReceivable.toFixed(2)}`}
          subtext={`${activeClients} clientes com débito`}
          icon={Wallet}
          colorClass="text-emerald-400 bg-emerald-400"
        />
        <StatCard 
          title="Próxima Cobrança" 
          value="Dia 20"
          subtext={getNextBillingWindowLabel()}
          icon={Calendar}
          colorClass="text-amber-400 bg-amber-400"
        />
        <StatCard 
          title="Vendas do Mês" 
          value={`R$ ${monthlySales.toFixed(2)}`}
          subtext="Total em produtos vendidos"
          icon={TrendingUp}
          colorClass="text-blue-400 bg-blue-400"
        />
        <StatCard 
          title="Recebido (Caixa)" 
          value={`R$ ${monthlyReceipts.toFixed(2)}`}
          subtext="Pagamentos confirmados este mês"
          icon={PiggyBank}
          colorClass="text-purple-400 bg-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Últimas Transações
          </h3>
          <div className="space-y-4">
            {transactions.slice().reverse().slice(0, 5).map((t) => {
              const isPayment = t.amount < 0;
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isPayment ? 'bg-purple-500/20 text-purple-400' : 'bg-[#0B0C10] text-emerald-400'}`}>
                      {isPayment ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.clientName}</p>
                      <p className="text-xs text-gray-500">{t.productName} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold font-mono block ${isPayment ? 'text-purple-400' : 'text-emerald-400'}`}>
                      {isPayment ? '' : '+'}R$ {Math.abs(t.amount).toFixed(2)}
                    </span>
                    {isPayment && <span className="text-[10px] text-gray-500 uppercase font-bold">Pago</span>}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada.</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
            Maiores Devedores
          </h3>
          <div className="space-y-4">
             {clients
              .filter(c => c.balance > 0)
              .sort((a, b) => b.balance - a.balance)
              .slice(0, 5)
              .map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0B0C10]/50 border border-white/5">
                  <p className="text-white font-medium">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Acumulado</span>
                    <span className="text-amber-400 font-bold">R$ {c.balance.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {activeClients === 0 && (
                 <p className="text-gray-500 text-center py-4">Tudo em dia! Nenhum cliente com débito.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;