
import React from 'react';
import { Settings, Palette, Eye, EyeOff, Globe, Bell, Shield, Check, Info } from 'lucide-react';
import { ThemeType } from '../App';

interface SettingsViewProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, privacyMode, setPrivacyMode }) => {
  const themes: {id: ThemeType, name: string, color: string}[] = [
    { id: 'classic', name: 'Finanza Classic', color: 'bg-blue-600' },
    { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-600' },
    { id: 'purple', name: 'Amethyst Night', color: 'bg-purple-600' },
    { id: 'ocean', name: 'Deep Ocean', color: 'bg-cyan-600' },
    { id: 'gold', name: 'Elite Gold', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Configurações do Sistema</h2>
        <p className="text-slate-400 text-sm">Personalize sua interface e preferências de segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personalização de Tema */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl">
              <Palette size={22} />
            </div>
            <h3 className="text-lg font-bold">Temas e Cores</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-3xl border transition-all flex items-center justify-between group ${
                  theme === t.id 
                    ? 'bg-slate-800 border-indigo-500/50 shadow-lg' 
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${t.color} shadow-lg`}></div>
                  <span className={`text-sm font-bold ${theme === t.id ? 'text-white' : 'text-slate-400'}`}>{t.name}</span>
                </div>
                {theme === t.id && <div className="p-1 bg-indigo-500 text-white rounded-full"><Check size={12} /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Privacidade e Exibição */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-2xl">
              <Shield size={22} />
            </div>
            <h3 className="text-lg font-bold">Privacidade e Segurança</h3>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => setPrivacyMode(!privacyMode)}
              className="flex items-center justify-between p-5 bg-slate-950 rounded-3xl border border-slate-800 cursor-pointer hover:bg-slate-800/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${privacyMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Modo Privacidade</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Ocultar valores financeiros na tela</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${privacyMode ? 'bg-rose-600' : 'bg-slate-800'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyMode ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800 text-slate-500 rounded-xl">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Autenticação Biométrica</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Solicitar FaceID ao abrir (Mobile)</p>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-slate-800"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferências Regionais */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-2xl">
              <Globe size={22} />
            </div>
            <h3 className="text-lg font-bold">Idioma e Moeda</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Moeda Principal</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-600">
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="BTC">Bitcoin (₿)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Idioma</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-600">
                <option value="PT">Português (BR)</option>
                <option value="EN">English (US)</option>
                <option value="ES">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações do App */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm space-y-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl">
              <Info size={22} />
            </div>
            <h3 className="text-lg font-bold">Sobre o Finanza</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-300 font-bold">Versão 3.4.0 (Build 2026)</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plataforma de inteligência patrimonial desenvolvida para investidores de alta performance. 
              Seus dados são criptografados localmente.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex gap-4">
             <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">Termos de Uso</button>
             <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">Privacidade</button>
             <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">Suporte</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
