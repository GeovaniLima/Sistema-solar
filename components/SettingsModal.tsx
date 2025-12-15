import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem("GEMINI_API_KEY");
    if (savedKey) setApiKey(savedKey);
  }, [isOpen]);

  const handleSave = () => {
    // Limpeza básica antes de salvar
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    if (cleanKey.length < 10) {
        alert("A chave parece muito curta. Verifique se copiou corretamente.");
        return;
    }

    localStorage.setItem("GEMINI_API_KEY", cleanKey);
    onKeySaved(); // Notifica o App para resetar a seleção
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Key className="text-blue-400" />
          Configurações
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Para acessar os dados de inteligência artificial em tempo real, você precisa configurar sua chave da API Gemini.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-semibold mb-2">
              Sua Chave de API (Gemini API Key)
            </label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave AIza..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
            />
          </div>

          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 text-sm hover:underline"
          >
            Obter uma chave gratuita <ExternalLink size={12} />
          </a>

          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
          >
            <Save size={18} />
            Salvar e Conectar
          </button>
        </div>
      </div>
    </div>
  );
};