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
import {
  LayoutDashboard,
  Wallet,
  Calculator,
  Target,
  BarChart2,
  Settings,
  LogOut
} from 'lucide-react';
import { Asset, FinancialGoal, AllocationGoals } from './types';

type View =
  | 'dashboard'
  | 'investments'
  | 'simulator'
  | 'goals'
  | 'reports'
  | 'settings';

interface UserData {
  name: string;
  photo: string;
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Usuário',
    photo:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150'
  });

  const [allocationGoals, setAllocationGoals] = useState<AllocationGoals>({
    fixedIncome: 50,
    variableIncome: 30,
    crypto: 20
  });

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] =
    useState<Partial<Asset> | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // BUSCAR ATIVOS DO SUPABASE
  // =========================
  const fetchAssets = async (userId: string) => {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ativos:', error);
      return;
    }

    const formatted: Asset[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      subtype: item.category,

      investedAmount: item.invested_amount || 0,
      yieldRate: item.annual_rate || 0,
      dividendYield: item.dividend_yield || 0,

      allocationDate: item.allocation_date,
      maturityDate: item.maturity_date,
      notes: item.notes || ''
    }));

    setAssets(formatted);
  };

  // =========================
  // MONITORAR LOGIN
  // =========================
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        const name = session.user.email?.split('@')[0] || 'Usuário';
        setUserData(prev => ({ ...prev, name }));
        fetchAssets(session.user.id);
      }
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);

        if (session?.user) {
          const name = session.user.email?.split('@')[0] || 'Usuário';
          setUserData(prev => ({ ...prev, name }));
          fetchAssets(session.user.id);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // =========================
  // SALVAR ATIVO NO SUPABASE
  // =========================
  const handleSaveAsset = async (asset: any) => {
    if (!supabase || !session?.user) return;

    const payload = {
      user_id: session.user.id,
      name: asset.name,
      type: asset.type,
      category: asset.category ?? asset.subtype ?? null,

      invested_amount: Number(asset.invested_amount) || null,
      current_value:
        Number(asset.current_value) ||
        Number(asset.invested_amount) ||
        null,

      annual_rate:
        asset.annual_rate !== null && asset.annual_rate !== undefined
          ? Number(asset.annual_rate)
          : null,

      dividend_yield:
        asset.dividend_yield !== null &&
        asset.dividend_yield !== undefined
          ? Number(asset.dividend_yield)
          : null,

      allocation_date: asset.allocation_date || null,
      maturity_date: asset.maturity_date || null,

      notes: asset.notes || null
    };

    console.log('Enviando para o Supabase:', payload);

    const { error } = await supabase.from('assets').insert([payload]);

    if (error) {
      console.error('Erro ao salvar ativo:', error);
      alert('Erro ao salvar ativo.');
      return;
    }

    await fetchAssets(session.user.id);

    setIsAssetModalOpen(false);
    setPrefilledAsset(undefined);
  };

  const handleDeleteAsset = async (id: string) => {
    if (!supabase || !session?.user) return;

    if (!confirm('Tem certeza que deseja excluir este ativo?')) return;

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao excluir ativo:', error);
      return;
    }

    fetchAssets(session.user.id);
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const duplicated: Asset = {
      ...asset,
      id: Math.random().toString(36).substr(2, 9),
      name: `${asset.name} (Cópia)`
    };
    handleSaveAsset(duplicated);
  };

  const handleOpenAssetModal = (initialData?: Partial<Asset>) => {
    setPrefilledAsset(initialData);
    setIsAssetModalOpen(true);
  };

  if (!session) {
    return <Login onLoginSuccess={(sess) => setSession(sess)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            assets={assets}
            goals={goals}
            privacyMode={privacyMode}
          />
        );
      case 'investments':
        return (
          <Investments
            assets={assets}
            allocationGoals={allocationGoals}
            onAddClick={() => handleOpenAssetModal()}
            onAIImport={data => handleOpenAssetModal(data)}
            onEditAsset={asset => handleOpenAssetModal(asset)}
            onDeleteAsset={handleDeleteAsset}
            onDuplicateAsset={handleDuplicateAsset}
          />
        );
      case 'simulator':
        return <Simulator />;
      case 'goals':
        return (
          <Goals
            goals={goals}
            assets={assets}
            allocationGoals={allocationGoals}
            setAllocationGoals={setAllocationGoals}
            setGoals={setGoals}
          />
        );
      case 'reports':
        return <Reports assets={assets} />;
      case 'settings':
        return (
          <SettingsView
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
          />
        );
      default:
        return (
          <Dashboard
            assets={assets}
            goals={goals}
            privacyMode={privacyMode}
          />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'investments', icon: Wallet, label: 'Investimentos' },
    { id: 'simulator', icon: Calculator, label: 'Simulador' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'reports', icon: BarChart2, label: 'Relatórios' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <TickerBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col bg-slate-900 border-r border-slate-800">
          <div className="p-8">
            <div className="flex items-center gap-3 text-blue-400 mb-10">
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl">
                <LayoutDashboard size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white italic">
                FINANZA
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-slate-800">
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-800"
            >
              <Settings size={20} />
              Configurações
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto">{renderView()}</div>
        </main>
      </div>

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
