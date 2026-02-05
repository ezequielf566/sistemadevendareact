import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ShoppingCart, Users, Settings, Gem, Download, Share } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-emerald-900 to-transparent text-emerald-400 border-l-4 border-emerald-400' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm tracking-wide">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS to show manual instructions if needed
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Capture the PWA install prompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full glass-panel border-r border-white/5 hidden md:flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Gem className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold font-montserrat text-lg tracking-tight">PREMIUM</h1>
            <p className="text-xs text-emerald-400 font-medium tracking-widest">BOMBONIERE</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentView === ViewState.DASHBOARD} 
            onClick={() => setView(ViewState.DASHBOARD)} 
          />
          <NavItem 
            icon={ShoppingCart} 
            label="Ponto de Venda" 
            active={currentView === ViewState.PDV} 
            onClick={() => setView(ViewState.PDV)} 
          />
          <NavItem 
            icon={Users} 
            label="Clientes" 
            active={currentView === ViewState.CLIENTS} 
            onClick={() => setView(ViewState.CLIENTS)} 
          />
          <NavItem 
            icon={Settings} 
            label="Configurações" 
            active={currentView === ViewState.SETTINGS} 
            onClick={() => setView(ViewState.SETTINGS)} 
          />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          {/* Desktop Install Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 p-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              <span className="font-bold text-sm">Instalar App</span>
            </button>
          )}

          <div className="bg-[#1F2833] rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Status do Sistema</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-400">Online & Sincronizado</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav - Z-Index lowered to 40 to allow Modals (z-50+) to overlap it */}
      <div className="md:hidden fixed bottom-0 w-full glass-panel border-t border-white/5 z-40 flex justify-around p-3 pb-safe-area">
         <button onClick={() => setView(ViewState.DASHBOARD)} className={`${currentView === ViewState.DASHBOARD ? 'text-emerald-400' : 'text-gray-500'}`}><LayoutDashboard /></button>
         <button onClick={() => setView(ViewState.PDV)} className={`${currentView === ViewState.PDV ? 'text-emerald-400' : 'text-gray-500'}`}><ShoppingCart /></button>
         <button onClick={() => setView(ViewState.CLIENTS)} className={`${currentView === ViewState.CLIENTS ? 'text-emerald-400' : 'text-gray-500'}`}><Users /></button>
         <button onClick={() => setView(ViewState.SETTINGS)} className={`${currentView === ViewState.SETTINGS ? 'text-emerald-400' : 'text-gray-500'}`}><Settings /></button>
      </div>

      {/* Main Content - Increased padding-bottom (pb-32) for mobile to clear the nav bar */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-32 md:pb-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-montserrat leading-tight">
              {currentView === ViewState.DASHBOARD && 'Visão Geral'}
              {currentView === ViewState.PDV && 'Nova Venda'}
              {currentView === ViewState.CLIENTS && 'Gestão de Clientes'}
              {currentView === ViewState.SETTINGS && 'Configurações'}
            </h2>
            
            {/* iOS Helper Text (Only shows on mobile/iOS) */}
            {isIOS && (
              <p className="md:hidden text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                <Share size={10} /> Adicione à tela de início para instalar
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile/Tablet Install Button */}
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="md:hidden bg-emerald-500/10 text-emerald-400 p-2 rounded-full hover:bg-emerald-500/20 transition-all animate-pulse"
                title="Instalar Aplicativo"
              >
                <Download size={20} />
              </button>
            )}

            <div className="text-right hidden md:block">
               <p className="text-sm text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;