// mesmo início de imports
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
import { LayoutDashboard, Wallet, Calculator, Target, BarChart2, Settings, Bell, Search, Camera, User, X, CheckCircle, LogOut } from 'lucide-react';
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
  const [prefilledAsset, setPrefilledAsset] = useState<Partial<Asset>>();

  // =========================
  // BUSCAR ATIVOS
  // =========================
  const fetchAssets = async (userId: string) => {
    const { data } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId);

    if (!data) return;

    const formatted: Asset[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      subtype: item.category,
      investedAmount: item.invested_amount || 0,
      yieldRate: item.annual_rate || 0,
      dividendYield: item.dividend_yield || 0,
      allocationDate: item.allocation_date,
      maturityDate: item.maturity_date,
      notes: item.notes || "",
    }));

    setAssets(formatted);
  };

  // =========================
  // LOGIN
  // =========================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAssets(session.user.id);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // =========================
  // SALVAR ATIVO
  // =========================
  const handleSaveAsset = async (asset: Asset) => {
    if (!session?.user) return;

    await supabase.from("assets").insert([
      {
        user_id: session.user.id,
        name: asset.name,
        type: asset.type,
        category: asset.subtype,
        invested_amount: asset.investedAmount,
        annual_rate: asset.yieldRate,
        dividend_yield: asset.dividendYield,
        allocation_date: asset.allocationDate,
        maturity_date: asset.maturityDate,
      },
    ]);

    fetchAssets(session.user.id);
    setIsAssetModalOpen(false);
  };

  const handleDeleteAsset = async (id: string) => {
    await supabase.from("assets").delete().eq("id", id);
    fetchAssets(session.user.id);
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const duplicated: Asset = {
      ...asset,
      id: Math.random().toString(36),
      name: `${asset.name} (Cópia)`
    };
    handleSaveAsset(duplicated);
  };

  if (!session) {
    return <Login onLoginSuccess={(sess) => setSession(sess)} />;
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'investments', icon: Wallet, label: 'Investimentos' },
    { id: 'simulator', icon: Calculator, label: 'Simulador' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'reports', icon: BarChart2, label: 'Relatórios' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard assets={assets} goals={goals} privacyMode={privacyMode} />;
      case 'investments':
        return (
          <Investments
            assets={assets}
            allocationGoals={allocationGoals}
            onAddClick={() => setIsAssetModalOpen(true)}
            onAIImport={(data) => setPrefilledAsset(data)}
            onEditAsset={(asset) => setPrefilledAsset(asset)}
            onDeleteAsset={handleDeleteAsset}
            onDuplicateAsset={handleDuplicateAsset}
          />
        );
      case 'simulator': return <Simulator />;
      case 'goals': return <Goals goals={goals} assets={assets} allocationGoals={allocationGoals} setAllocationGoals={setAllocationGoals} setGoals={setGoals} />;
      case 'reports': return <Reports assets={assets} />;
      case 'settings': return <SettingsView theme={theme} setTheme={setTheme} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} />;
      default: return <Dashboard assets={assets} goals={goals} privacyMode={privacyMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <aside className="w-64 bg-slate-900 p-6 space-y-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className="block w-full text-left px-4 py-2 rounded bg-slate-800 hover:bg-slate-700"
          >
            {item.label}
          </button>
        ))}
        <button onClick={handleLogout} className="text-rose-400">
          Sair
        </button>
      </aside>

      <main className="flex-1 p-8">
        {renderView()}
      </main>

      {isAssetModalOpen && (
        <AssetForm
          initialData={prefilledAsset}
          onClose={() => setIsAssetModalOpen(false)}
          onSave={handleSaveAsset}
        />
      )}
    </div>
  );
};

export default App;
