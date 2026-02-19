// App.tsx completo e estável
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
  LayoutDashboard, Wallet, Calculator, Target,
  BarChart2, Settings, Bell, Search, Camera,
  User, X, CheckCircle, LogOut
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

export type ThemeType =
  | 'classic'
  | 'emerald'
  | 'purple'
  | 'ocean'
  | 'gold';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Usuário',
    photo:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
  });

  const [allocationGoals, setAllocationGoals] =
    useState<AllocationGoals>({
      fixedIncome: 50,
      variableIncome: 30,
      crypto: 20,
    });

  const [isAssetModalOpen, setIsAssetModalOpen] =
    useState(false);
  const [prefilledAsset, setPrefilledAsset] =
    useState<Partial<Asset> | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // BUSCAR ATIVOS
  // =========================
  const fetchAssets = async (userId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const formatted: Asset[] = (data || []).map(
      (item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        subtype: item.category,

        investedAmount: item.invested_amount || 0,
        yieldRate: item.annual_rate || 0,
        dividendYield: item.dividend_yield || 0,

        allocationDate: item.allocation_date,
        maturityDate: item.maturity_date,
        notes: item.notes || '',
      })
    );

    setAssets(formatted);
  };

  // =========================
  // LOGIN
  // =========================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setSession(session);

      if (session?.user) {
        fetchAssets(session.user.id);
      }
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_e, session) => {
        setSession(session);
        if (session?.user) {
          fetchAssets(session.user.id);
        }
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  // =========================
  // SALVAR ATIVO
  // =========================
  const handleSaveAsset = async (asset: Asset) => {
    if (!session?.user) return;

    const { error } = await supabase.from('assets').insert([
      {
        user_id: session.user.id,
        name: asset.name,
        type: asset.type,
        category: asset.subtype || null,

        invested_amount:
          Number(asset.investedAmount) || 0,
        current_value:
          Number(asset.investedAmount) || 0,

        annual_rate: Number(asset.yieldRate) || 0,
        dividend_yield:
          Number(asset.dividendYield) || 0,

        allocation_date: asset.allocationDate || null,
        maturity_date: asset.maturityDate || null,
        notes: asset.notes || null,
      },
    ]);

    if (error) {
      console.error(error);
      alert('Erro ao salvar ativo.');
      return;
    }

    fetchAssets(session.user.id);
    setIsAssetModalOpen(false);
  };

  if (!session) {
    return (
      <Login onLoginSuccess={(s) => setSession(s)} />
    );
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
            onAddClick={() =>
              setIsAssetModalOpen(true)
            }
            onEditAsset={(a) => {
              setPrefilledAsset(a);
              setIsAssetModalOpen(true);
            }}
            onDeleteAsset={() => {}}
            onDuplicateAsset={() => {}}
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
            setAllocationGoals={
              setAllocationGoals
            }
            setGoals={setGoals}
          />
        );
      case 'reports':
        return <Reports assets={assets} />;
      case 'settings':
        return (
          <SettingsView
            theme={theme}
            setTheme={setTheme}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TickerBar />
      <div className="flex">
        <aside className="w-64 bg-slate-900 p-6">
          <button
            onClick={() =>
              setCurrentView('dashboard')
            }
          >
            Dashboard
          </button>
          <button
            onClick={() =>
              setCurrentView('investments')
            }
          >
            Investimentos
          </button>
        </aside>

        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>

      {isAssetModalOpen && (
        <AssetForm
          initialData={prefilledAsset}
          onClose={() =>
            setIsAssetModalOpen(false)
          }
          onSave={handleSaveAsset}
        />
      )}
    </div>
  );
};

export default App;
