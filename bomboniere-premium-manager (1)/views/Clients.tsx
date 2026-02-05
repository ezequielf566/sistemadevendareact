import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { getClients, saveClient, deleteClient, getSettings, settleClientDebt } from '../services/storage';
import { calculateDueDate, formatDate } from '../utils/dateLogic';
import { generateBillingLink } from '../utils/whatsapp';
import { Plus, Search, Calendar, Phone, MessageCircle, Filter, Trash2, AlertTriangle, X, Check, Wallet, Info, Copy, ExternalLink, Download } from 'lucide-react';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'debt'>('debt');
  
  // Modals State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToSettle, setClientToSettle] = useState<Client | null>(null);
  const [clientToBill, setClientToBill] = useState<Client | null>(null);
  const [showBillHelp, setShowBillHelp] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    setClients(getClients());
  }, []);

  const refreshClients = () => {
    setClients(getClients());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newClient: Client = {
      id: crypto.randomUUID(),
      name: newName,
      phone: newPhone,
      balance: 0
    };

    saveClient(newClient);
    refreshClients();
    setShowForm(false);
    setNewName('');
    setNewPhone('');
  };

  const handleDeleteClick = (client: Client) => setClientToDelete(client);
  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      refreshClients();
      setClientToDelete(null);
    }
  };

  const handleSettleClick = (client: Client) => setClientToSettle(client);
  const confirmSettle = () => {
    if (clientToSettle) {
      settleClientDebt(clientToSettle.id);
      refreshClients();
      setClientToSettle(null);
    }
  };

  const handleBillClick = (client: Client) => setClientToBill(client);

  const getBillingLink = (client: Client) => {
    const settings = getSettings();
    const dueDate = calculateDueDate(new Date()).toISOString();
    return generateBillingLink(client.phone, {
      clientName: client.name,
      totalBalance: client.balance,
      dueDate: dueDate,
      pixKey: settings.pixKey
    });
  };

  const sendBillWhatsApp = () => {
    if (clientToBill) {
      const link = getBillingLink(clientToBill);
      window.open(link, '_blank');
    }
  };

  const copyBillText = () => {
    if (clientToBill) {
      const link = getBillingLink(clientToBill);
      const message = decodeURIComponent(link.split('text=')[1]);
      navigator.clipboard.writeText(message);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const filtered = clients
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filter === 'all' ? true : c.balance > 0);

  const isOverdue = (lastPurchaseStr?: string) => {
    if (!lastPurchaseStr) return false;
    const today = new Date();
    const dueDate = calculateDueDate(new Date(lastPurchaseStr));
    return today > dueDate;
  };

  const getDueDateDisplay = (lastPurchaseStr?: string) => {
    if (!lastPurchaseStr) return '-';
    const dueDate = calculateDueDate(new Date(lastPurchaseStr));
    return formatDate(dueDate.toISOString());
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar clientes..." 
            className="w-full bg-glass border border-white/10 bg-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setFilter('debt')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'debt' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}>Com Débito</button>
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>Todos</button>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold p-3 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"><Plus size={20} /></button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 glass-panel p-6 rounded-xl border border-emerald-500/30 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-4">Cadastrar Novo Cliente</h3>
          <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Nome Completo" className="flex-1 bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
            <input type="text" placeholder="WhatsApp (ex: 5511999999999)" className="flex-1 bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            <div className="flex gap-2">
              <button type="submit" className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-emerald-400">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 opacity-50"><Filter className="mx-auto mb-2" size={32} /><p>Nenhum cliente encontrado.</p></div>
        )}
        {filtered.map(client => {
          const overdue = client.balance > 0 && isOverdue(client.lastPurchase);
          const dueDate = getDueDateDisplay(client.lastPurchase);
          return (
            <div key={client.id} className={`glass-panel p-5 rounded-xl border transition-all group flex flex-col relative ${overdue ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 hover:border-emerald-500/30'}`}>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(client); }} className="absolute top-2 right-2 p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all z-20 cursor-pointer" title="Excluir Cliente"><Trash2 size={20} /></button>
              <div className="flex justify-between items-start mb-4 pr-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg border border-white/10 group-hover:border-emerald-500 transition-colors">{client.name.charAt(0)}</div>
                  <div className="overflow-hidden"><h4 className="text-white font-bold text-lg truncate w-full">{client.name}</h4><div className="flex items-center gap-1 text-gray-400 text-xs"><Phone size={10} /><span>{client.phone}</span></div></div>
                </div>
              </div>
              <div className="text-right mb-4"><p className="text-xs text-gray-500 mb-1">Total Devido</p><p className={`font-mono text-xl font-bold ${client.balance > 0 ? (overdue ? 'text-red-400' : 'text-amber-400') : 'text-emerald-400'}`}>R$ {client.balance.toFixed(2)}</p></div>
              <div className="border-t border-white/5 pt-3 mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs"><span className="text-gray-500 flex items-center gap-1"><Calendar size={12} /> Próx. Vencimento</span><span className={`${overdue ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}`}>{client.balance > 0 ? dueDate : '-'}</span></div>
                {client.balance > 0 ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleBillClick(client)} className={`flex-1 flex items-center justify-center gap-2 border py-3 rounded-lg transition-all text-sm font-bold ${overdue ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Enviar Cobrança via WhatsApp"><MessageCircle size={16} />{overdue ? 'Cobrar' : 'Lembrar'}</button>
                    <button onClick={() => handleSettleClick(client)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20" title="Registrar Pagamento"><Check size={16} />Receber</button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-sm text-gray-600 font-medium bg-white/5 rounded-lg border border-white/5 border-dashed">Nada pendente</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: BILLING CONFIRMATION & HELP */}
      {clientToBill && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-[#1F2833] w-full max-w-sm rounded-3xl p-8 border border-emerald-500/20 shadow-2xl flex flex-col items-center text-center">
            
            {!showBillHelp ? (
              <div className="w-full">
                <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] mb-4 mx-auto">
                   <MessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enviar Cobrança</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Enviar resumo de pendências de <strong className="text-white">R$ {clientToBill.balance.toFixed(2)}</strong> para <strong>{clientToBill.name}</strong>?
                </p>

                <div className="space-y-3 mb-6">
                  <button 
                    onClick={sendBillWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#22c35e] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group shadow-lg shadow-[#25D366]/20"
                  >
                    <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    Abrir WhatsApp
                  </button>
                  <button 
                    onClick={copyBillText}
                    className={`w-full bg-white/5 border border-white/10 text-gray-300 font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${copyFeedback ? 'text-emerald-400 border-emerald-400/50' : 'hover:bg-white/10'}`}
                  >
                    {copyFeedback ? <Check size={18} /> : <Copy size={18} />}
                    {copyFeedback ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                <button onClick={() => setShowBillHelp(true)} className="text-gray-500 hover:text-emerald-400 text-xs flex items-center justify-center gap-2 mb-6"><Info size={14} /> WhatsApp não abriu?</button>

                <button onClick={() => setClientToBill(null)} className="w-full py-3 text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-4">Cancelar</button>
              </div>
            ) : (
              <div className="w-full text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-white font-bold flex items-center gap-2"><Info className="text-emerald-400" /> Ajuda</h4>
                    <button onClick={() => setShowBillHelp(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-emerald-500/10 p-3 rounded-xl h-fit"><ExternalLink className="text-emerald-400" size={24} /></div>
                      <div>
                        <p className="text-white font-bold text-sm">O aplicativo não abriu?</p>
                        <p className="text-xs text-gray-500 mt-1">No celular, se você não tem o app instalado, a tela pode travar. Use o botão "Copiar Texto" e envie manualmente.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl h-fit"><Download className="text-blue-400" size={24} /></div>
                      <div>
                        <p className="text-white font-bold text-sm">Instalar WhatsApp</p>
                        <p className="text-xs text-gray-500 mt-1">Para funcionar corretamente, instale o WhatsApp oficial da Play Store ou App Store.</p>
                        <a href="https://www.whatsapp.com/download" target="_blank" className="text-blue-400 text-xs font-bold mt-2 inline-block underline">Baixar Agora</a>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowBillHelp(false)} className="w-full mt-8 bg-emerald-500 text-black font-bold py-3 rounded-xl">Voltar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#1F2833] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
            <button onClick={() => setClientToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Excluir Cliente?</h3>
              <p className="text-gray-400">Tem certeza que deseja remover <strong>{clientToDelete.name}</strong>? <br/><span className="text-xs text-gray-500 mt-2 block">(O histórico de vendas permanecerá salvo)</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setClientToDelete(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {clientToSettle && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#1F2833] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
            <button onClick={() => setClientToSettle(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4"><Wallet size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Pagamento</h3>
              <p className="text-gray-400">Confirmar recebimento de <strong className="text-emerald-400">R$ {clientToSettle.balance.toFixed(2)}</strong> de <strong>{clientToSettle.name}</strong>? <br/><span className="text-xs text-gray-500 mt-2 block">(Isso zerará o saldo devedor do cliente)</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setClientToSettle(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={confirmSettle} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"><Check size={18} />Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;