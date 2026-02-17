
import React, { useState } from 'react';
import { X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { parseAssetFromText } from '../services/geminiService';
import { Asset } from '../types';

interface ChatImportModalProps {
  onClose: () => void;
  onProcessed: (data: Partial<Asset>) => void;
}

const ChatImportModal: React.FC<ChatImportModalProps> = ({ onClose, onProcessed }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'bot' | 'user'; content: string }[]>([
    { role: 'bot', content: 'Olá! Sou seu assistente de investimentos. Pode colar aqui um texto com os detalhes do seu ativo (CDB, Ações, FIIs, etc) e eu vou preencher tudo para você automaticamente. 🚀' }
  ]);

  const handleProcess = async () => {
    if (!text.trim()) return;
    
    const userMessage = text;
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setText('');
    setLoading(true);
    
    const result = await parseAssetFromText(userMessage);
    setLoading(false);
    
    if (result) {
      setHistory(prev => [...prev, { role: 'bot', content: 'Consegui extrair as informações! Estou abrindo o formulário de cadastro para sua revisão final.' }]);
      setTimeout(() => {
        onProcessed(result);
      }, 1500);
    } else {
      setHistory(prev => [...prev, { role: 'bot', content: 'Desculpe, não consegui identificar os dados desse investimento. Pode tentar descrever de outra forma? (Ex: CDB Banco X, 12% a.a, vencimento em 2026)' }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-800 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/40">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-white tracking-tight">Importação via IA</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alimentado por Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="p-6 h-[400px] overflow-y-auto space-y-4 bg-slate-950/30 flex flex-col scrollbar-thin">
          {history.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 h-fit rounded-xl ${msg.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-blue-600/20 text-blue-400'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="p-2 h-fit rounded-xl bg-blue-600/20 text-blue-400">
                <Bot size={18} />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-xs font-bold text-slate-400 animate-pulse">Processando texto...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleProcess())}
              placeholder="Cole aqui os dados do investimento..."
              className="w-full p-5 pr-16 rounded-[1.5rem] bg-slate-950 text-white border border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none min-h-[100px] max-h-[150px] resize-none text-sm transition-all shadow-inner"
              disabled={loading}
            />
            <button
              onClick={handleProcess}
              disabled={loading || !text.trim()}
              className="absolute bottom-4 right-4 p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-4 font-bold uppercase tracking-widest">
            A IA pode cometer erros. Revise os dados antes de salvar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatImportModal;
