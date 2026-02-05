import React, { useState, useEffect, useMemo } from 'react';
import { Client, Product, Transaction } from '../types';
import { getClients, addTransaction, getSettings, getProducts, saveProduct, deleteProduct } from '../services/storage';
import { calculateDueDate } from '../utils/dateLogic';
import { generateSaleLink } from '../utils/whatsapp';
import { Search, Plus, User, Minus, Trash2, ShoppingBag, ArrowRight, X, Check, Pencil, ChevronUp, ChevronDown, Candy, Coffee, Cookie, IceCream, Sandwich, Wine, Beer, Cake, Pizza, Utensils, Zap } from 'lucide-react';

// Icon mapping available for selection
const AVAILABLE_ICONS = [
  { id: 'candy', icon: Candy },
  { id: 'coffee', icon: Coffee },
  { id: 'cookie', icon: Cookie },
  { id: 'ice-cream', icon: IceCream },
  { id: 'sandwich', icon: Sandwich },
  { id: 'wine', icon: Wine },
  { id: 'beer', icon: Beer },
  { id: 'cake', icon: Cake },
  { id: 'pizza', icon: Pizza },
  { id: 'utensils', icon: Utensils },
  { id: 'zap', icon: Zap },
];

const getIcon = (iconName: string) => {
  const found = AVAILABLE_ICONS.find(i => i.id === iconName);
  const IconComponent = found ? found.icon : Coffee;
  return <IconComponent size={28} />;
};

interface CartItem {
  tempId: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
}

const POS: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  
  // Product Management State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodIcon, setProdIcon] = useState('coffee');

  useEffect(() => {
    setClients(getClients());
    setProducts(getProducts());
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((a, b) => a + b.qty, 0), [cart]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setStep(2);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { tempId: crypto.randomUUID(), productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (tempId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.tempId === tempId) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (tempId: string) => {
    setCart(prev => prev.filter(item => item.tempId !== tempId));
    if (cart.length <= 1) setIsCartExpanded(false);
  };

  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdPrice(product.price.toString());
      setProdIcon(product.icon);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdPrice('');
      setProdIcon('coffee');
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = () => {
    if (!prodName || !prodPrice) return;
    const price = parseFloat(prodPrice.replace(',', '.'));
    if (isNaN(price)) return;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : crypto.randomUUID(),
      name: prodName,
      price: price,
      icon: prodIcon
    };

    saveProduct(newProduct);
    setProducts(getProducts());
    setShowProductForm(false);
  };

  const handleDeleteProduct = () => {
    if (editingProduct && window.confirm("Excluir este produto?")) {
      deleteProduct(editingProduct.id);
      setProducts(getProducts());
      setShowProductForm(false);
    }
  };

  const handleFinishSale = () => {
    if (!selectedClient || cart.length === 0) return;

    const now = new Date();
    const dueDate = calculateDueDate(now);
    const settings = getSettings();

    cart.forEach(item => {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        productId: item.productId,
        productName: item.qty > 1 ? `${item.name} (${item.qty}x)` : item.name,
        amount: item.price * item.qty,
        date: now.toISOString(),
        dueDate: dueDate.toISOString(),
        isPaid: false
      };
      addTransaction(transaction);
    });

    if (settings.instantMessage) {
       const link = generateSaleLink(selectedClient.phone, {
         clientName: selectedClient.name,
         items: cart,
         totalSale: cartTotal,
         dueDate: dueDate.toISOString(),
         currentBalance: selectedClient.balance,
         pixKey: settings.pixKey
       });
       window.open(link, '_blank');
    }

    alert("Confirmado!");
    setCart([]);
    setStep(1);
    setSelectedClient(null);
    setSearchTerm('');
    setClients(getClients());
    setIsCartExpanded(false);
  };

  // --- Views ---

  if (step === 1) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="text-emerald-400" /> Selecione o Cliente
        </h2>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredClients.map(client => (
            <button 
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/50 transition-all flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0B0C10] flex items-center justify-center text-emerald-400 font-bold">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{client.name}</p>
                  <p className="text-xs text-gray-500">Saldo: R$ {client.balance.toFixed(2)}</p>
                </div>
              </div>
              <ArrowRight className="text-gray-600 group-hover:text-emerald-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => {setStep(1); setCart([]);}} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400">
             <ArrowRight className="rotate-180" size={20} />
          </button>
          <div>
            <h3 className="font-bold text-white leading-tight">{selectedClient?.name}</h3>
            <p className="text-xs text-gray-400">Adicionando itens</p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto custom-scrollbar pb-32 pr-1">
        
        {/* Add Product Card */}
        <button 
          onClick={() => openProductForm()}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all gap-2 min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Plus size={24} />
          </div>
          <span className="font-medium text-gray-400 text-sm text-center">Novo Produto</span>
        </button>

        {/* Product Cards */}
        {products.map(product => (
          <div
            key={product.id}
            className="relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/50 transition-all gap-2 min-h-[140px] group overflow-hidden"
          >
            {/* Edit Button (Top Right) */}
            <button 
              onClick={(e) => { e.stopPropagation(); openProductForm(product); }}
              className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-white hover:bg-white/10 rounded-full z-10 opacity-50 group-hover:opacity-100 transition-all"
            >
              <Pencil size={14} />
            </button>

            <button onClick={() => addToCart(product)} className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="text-gray-400 group-hover:text-white transition-colors">
                {getIcon(product.icon)}
              </div>
              <span className="font-medium text-gray-300 group-hover:text-white text-center text-sm leading-tight">{product.name}</span>
              <span className="text-sm font-bold text-amber-400">R$ {product.price.toFixed(2)}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Cart Bar */}
      <div className={`fixed bottom-0 left-0 right-0 md:absolute md:w-full bg-[#161920] border-t border-white/10 z-[60] transition-all duration-300 flex flex-col ${isCartExpanded ? 'h-[85vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'h-24 md:h-20'}`}>
        
        {/* Drag Handle / Toggle for Mobile */}
        <div 
          onClick={() => setIsCartExpanded(!isCartExpanded)}
          className="w-full h-8 shrink-0 flex items-center justify-center cursor-pointer hover:bg-white/5 bg-[#1F2833]/50 rounded-t-3xl border-b border-white/5"
        >
          {isCartExpanded ? <ChevronDown size={20} className="text-emerald-400" /> : <ChevronUp size={20} className="text-emerald-400" />}
        </div>

        {/* Cart Content Area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          
          {/* Expanded List */}
          {isCartExpanded && (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 shrink-0">
                 <h4 className="text-white font-bold flex items-center gap-2 text-lg"><ShoppingBag size={20} className="text-emerald-400"/> Sua Sacola</h4>
                 <button onClick={() => setCart([])} className="text-sm text-red-400 font-medium hover:text-red-300">Limpar</button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4 pr-1">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 gap-2">
                     <ShoppingBag size={48} />
                     <p>Nenhum item adicionado</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.tempId} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <p className="text-base font-medium text-white">{item.name}</p>
                        <p className="text-sm text-amber-400 font-mono">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-[#0B0C10] rounded-lg p-1.5">
                         <button onClick={() => updateQty(item.tempId, -1)} className="p-1 text-gray-500 hover:text-white"><Minus size={16} /></button>
                         <span className="text-base font-bold w-6 text-center text-white">{item.qty}</span>
                         <button onClick={() => updateQty(item.tempId, 1)} className="p-1 text-emerald-400 hover:text-emerald-300"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.tempId)} className="ml-4 text-red-500 p-2 hover:bg-red-500/10 rounded-full">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Confirm Button INSIDE Expanded Cart */}
              <div className="shrink-0 pt-4 border-t border-white/10 bg-[#161920]">
                <div className="flex justify-between items-end mb-4 px-2">
                  <span className="text-gray-400">Total a pagar</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleFinishSale}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 text-lg"
                >
                  <Check size={24} />
                  Confirmar Venda
                </button>
              </div>
            </div>
          )}

          {/* Collapsed State (Just the trigger bar) */}
          {!isCartExpanded && (
            <button 
              onClick={() => setIsCartExpanded(true)}
              className="flex items-center justify-between w-full h-full"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className={`text-emerald-400 ${cart.length === 0 ? 'opacity-50' : ''}`} size={28} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">Total atual</p>
                  <p className="text-xl font-bold text-white font-mono">R$ {cartTotal.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
                Ver Sacola <ChevronUp size={16} />
              </div>
            </button>
          )}

        </div>
      </div>

      {/* Product Form Modal - Increased Z-Index to 60 to overlap mobile nav (z-40) */}
      {showProductForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1F2833] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
             <h3 className="text-lg font-bold text-white mb-4">
               {editingProduct ? 'Editar Produto' : 'Novo Produto'}
             </h3>
             
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-gray-400">Nome do Produto</label>
                 <input 
                   type="text" 
                   value={prodName}
                   onChange={e => setProdName(e.target.value)}
                   className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                   placeholder="Ex: Bolo de Pote"
                 />
               </div>
               <div>
                 <label className="text-xs text-gray-400">Preço (R$)</label>
                 <input 
                   type="text" 
                   value={prodPrice}
                   onChange={e => setProdPrice(e.target.value)}
                   className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none text-lg font-mono"
                   placeholder="0,00"
                 />
               </div>
               
               <div>
                 <label className="text-xs text-gray-400 mb-2 block">Ícone</label>
                 <div className="grid grid-cols-5 gap-2">
                   {AVAILABLE_ICONS.map(item => (
                     <button
                       key={item.id}
                       onClick={() => setProdIcon(item.id)}
                       className={`p-2 rounded-lg flex items-center justify-center transition-all ${prodIcon === item.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                     >
                       <item.icon size={20} />
                     </button>
                   ))}
                 </div>
               </div>

               <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                 {editingProduct && (
                   <button onClick={handleDeleteProduct} className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white">
                     <Trash2 size={20} />
                   </button>
                 )}
                 <button onClick={() => setShowProductForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10">Cancelar</button>
                 <button onClick={handleSaveProduct} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400">Salvar</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;