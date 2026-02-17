
import React, { useState, useRef, useEffect } from 'react';
import TickerBar from './components/TickerBar';
import Dashboard from './components/Dashboard';
import Investments from './components/Investments';
import Simulator from './components/Simulator';
import Goals from './components/Goals';
import Reports from './components/Reports';
import AssetForm from './components/AssetForm';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import { supabase } from './services/supabase';
import { INITIAL_ASSETS, INITIAL_GOALS } from './constants';
import { LayoutDashboard, Wallet, Calculator, Target, BarChart2, Settings, Menu, Bell, Search, Camera, User, X, CheckCircle, LogOut } from 'lucide-react';
import { Asset, FinancialGoal, AllocationGoals } from './types';

type View = 'dashboard' | 'investments' | 'simulator' | 'goals' | 'reports' | 'settings';

interface UserData {
  name: string;
  photo: string;
}

export type ThemeType = 'classic' | 'emerald' | 'purple' | 'ocean' | 'gold';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Usuário',
    photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150'
  });
  const [allocationGoals, setAllocationGoals] = useState<AllocationGoals>({
    fixedIncome: 50,
    variableIncome: 30,
    crypto: 20
  });
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<Partial<Asset> | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitorar autenticação
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserData(prev => ({ ...prev, name: session.user.email?.split('@')[0] || 'Usuário' }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserData(prev => ({ ...prev, name: session.user.email?.split('@')[0] || 'Usuário' }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const themeClasses: Record<ThemeType, string> = {
    classic: 'selection:bg-blue-600/30',
    emerald: 'selection:bg-emerald-600/30',
    purple: 'selection:bg-purple-600/30',
    ocean: 'selection:bg-cyan-600/30',
    gold: 'selection:bg-amber-600/30'
  };

  const accentColor: Record<ThemeType, string> = {
    classic: 'blue',
    emerald: 'emerald',
    purple: 'purple',
    ocean: 'cyan',
    gold: 'amber'
  };

  const handleOpenAssetModal = (initialData?: Partial<Asset>) => {
    setPrefilledAsset(initialData);
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (savedAsset: Asset) => {
    setAssets(prev => {
      const exists = prev.find(a => a.id === savedAsset.id);
      if (exists) {
        return prev.map(a => a.id === savedAsset.id ? savedAsset : a);
      }
      return [...prev, savedAsset];
    });
    setIsAssetModalOpen(false);
    setPrefilledAsset(undefined);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const duplicated: Asset = {
      ...asset,
      id: Math.random().toString(36).substr(2, 9),
      name: `${asset.name} (Cópia)`
    };
    setAssets(prev => [...prev, duplicated]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!session) {
    return <Login onLoginSuccess={(sess) => setSession(sess)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard assets={assets} goals={goals} privacyMode={privacyMode} />;
      case 'investments': return (
        <Investments 
          assets={assets} 
          allocationGoals={allocationGoals}
          onAddClick={() => handleOpenAssetModal()} 
          onAIImport={(data) => handleOpenAssetModal(data)}
          onEditAsset={(asset) => handleOpenAssetModal(asset)}
          onDeleteAsset={handleDeleteAsset}
          onDuplicateAsset={handleDuplicateAsset}
        />
      );
      case 'simulator': return <Simulator />;
      case 'goals': return (
        <Goals 
          goals={goals} 
          assets={assets} 
          allocationGoals={allocationGoals} 
          setAllocationGoals={setAllocationGoals}
          setGoals={setGoals}
        />
      );
      case 'reports': return <Reports assets={assets} />;
      case 'settings': return (
        <SettingsView 
          theme={theme} 
          setTheme={setTheme} 
          privacyMode={privacyMode} 
          setPrivacyMode={setPrivacyMode} 
        />
      );
      default: return <Dashboard assets={assets} goals={goals} privacyMode={privacyMode} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'investments', icon: Wallet, label: 'Investimentos' },
    { id: 'simulator', icon: Calculator, label: 'Simulador' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'reports', icon: BarChart2, label: 'Relatórios' },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col text-slate-100 ${themeClasses[theme]}`}>
      <TickerBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-72 flex-col bg-slate-900 border-r border-slate-800 h-[calc(100vh-40px)] sticky top-[40px] z-40">
          <div className="p-8">
            <div className={`flex items-center gap-3 text-${accentColor[theme]}-400 mb-10`}>
              <div className={`bg-${accentColor[theme]}-600 text-white p-2.5 rounded-2xl shadow-xl shadow-${accentColor[theme]}-900/30`}>
                <LayoutDashboard size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white italic">FINANZA</span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                    currentView === item.id 
                    ? `bg-${accentColor[theme]}-600 text-white shadow-lg shadow-${accentColor[theme]}-900/20` 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon size={20} className={currentView === item.id ? 'animate-pulse' : ''} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-slate-800/50 space-y-2">
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${
                currentView === 'settings' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Settings size={20} />
              Configurações
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 bg-slate-950 relative">
          <header className="flex items-center justify-between mb-10">
            <div className={`md:hidden flex items-center gap-3 text-${accentColor[theme]}-400`}>
              <div className={`bg-${accentColor[theme]}-600 text-white p-2 rounded-lg`}>
                <LayoutDashboard size={18} />
              </div>
              <span className="text-xl font-black text-white italic">FINANZA</span>
            </div>

            <div className="flex-1 hidden md:flex max-w-md">
              <div className="relative w-full group">
                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-${accentColor[theme]}-500 transition-colors`} />
                <input 
                  type="text" 
                  placeholder="Pesquisar ativos ou metas..." 
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900 text-white rounded-2xl border-none ring-1 ring-slate-800 focus:ring-2 focus:ring-${accentColor[theme]}-600 outline-none transition-all shadow-sm`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-all shadow-sm ring-1 ring-slate-800 relative group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-bounce"></span>
              </button>
              
              {/* Profile Trigger */}
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className={`flex items-center gap-4 p-1.5 pl-5 bg-slate-900 rounded-[1.5rem] shadow-sm ring-1 ring-slate-800 hover:ring-${accentColor[theme]}-600 hover:bg-slate-800 transition-all group`}
                title="Editar Perfil"
              >
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-bold text-white group-hover:text-${accentColor[theme]}-400 transition-colors`}>{userData.name}</span>
                  <span className={`text-[10px] font-black text-${accentColor[theme]}-500 uppercase tracking-widest`}>Premium Plan</span>
                </div>
                <div className="relative">
                  <img src={userData.photo} className={`w-11 h-11 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-${accentColor[theme]}-500 transition-colors`} alt="User" />
                  <div className={`absolute -bottom-1 -right-1 bg-${accentColor[theme]}-600 rounded-lg p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75`}>
                    <Camera size={12} />
                  </div>
                </div>
              </button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex justify-between items-center z-50">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === item.id ? `text-${accentColor[theme]}-400 scale-110` : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Profile Edit Modal Refinado */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 bg-${accentColor[theme]}-600/20 text-${accentColor[theme]}-400 rounded-2xl`}>
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Editar Perfil</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personalize sua experiência</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Photo Section */}
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={userData.photo} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-slate-800 shadow-2xl group-hover:brightness-50 transition-all" alt="Profile" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-2">
                    <Camera size={32} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase">Upload de Foto</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-slate-900 shadow-lg">
                    <CheckCircle size={16} />
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <div className="w-full space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ou cole uma URL da Imagem</label>
                   <input 
                    type="text" 
                    className={`w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-5 text-sm text-${accentColor[theme]}-400 focus:ring-2 focus:ring-${accentColor[theme]}-600 outline-none transition-all placeholder-slate-700`}
                    placeholder="Cole a URL da sua foto aqui..."
                    value={userData.photo}
                    onChange={(e) => setUserData({...userData, photo: e.target.value})}
                  />
                </div>
              </div>

              {/* Name Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                <input 
                  type="text"
                  className={`w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-lg font-bold text-white focus:ring-2 focus:ring-${accentColor[theme]}-600 outline-none transition-all shadow-inner`}
                  placeholder="Seu nome"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              </div>

              {/* Save Button */}
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className={`w-full py-5 bg-${accentColor[theme]}-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-${accentColor[theme]}-900/50 hover:bg-${accentColor[theme]}-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2`}
              >
                Salvar Alterações
              </button>
            </div>
            
            <div className="p-6 bg-slate-800/30 border-t border-slate-800 text-center">
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sua conta é verificada e segura • Finanza SSL</p>
            </div>
          </div>
        </div>
      )}

      {isAssetModalOpen && (
        <AssetForm 
          initialData={prefilledAsset}
          onClose={() => {
            setIsAssetModalOpen(false);
            setPrefilledAsset(undefined);
          }} 
          onSave={handleSaveAsset} 
        />
      )}
    </div>
  );
};

export default App;
