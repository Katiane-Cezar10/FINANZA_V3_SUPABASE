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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<Partial<Asset> | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // BUSCAR ATIVOS DO SUPABASE
  // =========================
  const fetchAssets = async (userId: string) => {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar ativos:", error);
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
      notes: item.notes || "",
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
  const handleSaveAsset = async (asset: Asset) => {
    if (!supabase || !session?.user) return;

    const { error } = await supabase.from("assets").insert([
      {
        user_id: session.user.id,
        name: asset.name,
        type: asset.type,
        category: asset.subtype || null,

        invested_amount: asset.investedAmount || 0,
        current_value: asset.investedAmount || 0,

        annual_rate: asset.yieldRate || 0,
        dividend_yield: asset.dividendYield || 0,

        allocation_date: asset.allocationDate || null,
        maturity_date: asset.maturityDate || null,

        notes: asset.notes || null,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar ativo:", error);
      alert("Erro ao salvar ativo.");
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
      .from("assets")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Erro ao excluir ativo:", error);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TickerBar />

      <div className="flex">
        <main className="flex-1 px-6 py-8">
          {renderView()}
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
