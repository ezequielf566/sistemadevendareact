import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { AppSettings } from '../types';
import { Save, Lock, MessageCircle, Type } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    pixKey: '',
    ownerName: '',
    instantMessage: true,
    customGreeting: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="glass-panel p-8 rounded-2xl space-y-8">
        
        {/* PIX Configuration */}
        <section>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="text-emerald-400" size={24} />
            Dados de Recebimento (PIX)
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Configure sua chave PIX. Ela será enviada automaticamente na mensagem de cobrança do WhatsApp.
          </p>
          <div className="space-y-4">
             <div>
              <label className="block text-sm text-gray-500 mb-1">Nome do Proprietário / Estabelecimento</label>
              <input 
                type="text"
                value={settings.ownerName}
                onChange={(e) => setSettings({...settings, ownerName: e.target.value})}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Chave PIX (CPF, Email, Telefone ou Aleatória)</label>
              <input 
                type="text"
                value={settings.pixKey}
                onChange={(e) => setSettings({...settings, pixKey: e.target.value})}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none font-mono"
                placeholder="Ex: 12.345.678/0001-90"
              />
            </div>
          </div>
        </section>

        <div className="w-full h-[1px] bg-white/5"></div>

        {/* WhatsApp Automation */}
        <section>
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="text-emerald-400" size={24} />
            Automação WhatsApp
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="font-bold text-white">Envio Imediato de Comprovante</p>
                <p className="text-sm text-gray-400 mt-1">
                  Se ativado, abre o WhatsApp Web imediatamente após registrar uma venda no PDV.
                </p>
              </div>
              <button 
                onClick={() => setSettings({...settings, instantMessage: !settings.instantMessage})}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.instantMessage ? 'bg-emerald-500' : 'bg-gray-600'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.instantMessage ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Type size={16} className="text-emerald-400" />
                Mensagem Inicial Personalizada
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                Deixe em branco para usar o padrão. Use <strong>{'{cliente}'}</strong> onde quiser que apareça o nome do cliente.
              </p>
              <textarea 
                value={settings.customGreeting}
                onChange={(e) => setSettings({...settings, customGreeting: e.target.value})}
                className="w-full h-24 bg-[#0B0C10] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none"
                placeholder="Ex: Olá {cliente}, tudo bem? Aqui é da Bomboniere! Segue seu pedido:"
              />
            </div>
          </div>
        </section>

         <div className="w-full h-[1px] bg-white/5"></div>

         <div className="flex justify-end">
           <button 
             onClick={handleSave}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all ${saved ? 'bg-green-500' : 'bg-emerald-500 hover:bg-emerald-400'}`}
           >
             <Save size={20} />
             {saved ? 'Salvo!' : 'Salvar Alterações'}
           </button>
         </div>

      </div>
    </div>
  );
};

export default Settings;