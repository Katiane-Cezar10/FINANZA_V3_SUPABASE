
import React, { useState, useEffect } from 'react';
import { FinancialGoal, Asset, AllocationGoals } from '../types';
import { Target, Sparkles, AlertCircle, TrendingUp, ChevronRight, Plus, Calendar, Coins, LayoutGrid } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';

interface GoalsProps {
  goals: FinancialGoal[];
  assets: Asset[];
  allocationGoals: AllocationGoals;
  setAllocationGoals: React.Dispatch<React.SetStateAction<AllocationGoals>>;
  setGoals: React.Dispatch<React.SetStateAction<FinancialGoal[]>>;
}

const Goals: React.FC<GoalsProps> = ({ goals, assets, allocationGoals, setAllocationGoals, setGoals }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isWealthGoalModalOpen, setIsWealthGoalModalOpen] = useState(false);

  const [wealthGoalForm, setWealthGoalForm] = useState({
    name: '',
    value: 100000,
    years: 5
  });

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await getFinancialInsights(assets, goals);
      setInsights(res);
      setLoadingInsights(false);
    };
    if (goals.length > 0) fetchInsights();
  }, [goals, assets]);

  const handleUpdateAllocation = (field: keyof AllocationGoals, value: number) => {
    setAllocationGoals(prev => ({ ...prev, [field]: value }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineDate = new Date();
    deadlineDate.setFullYear(deadlineDate.getFullYear() + wealthGoalForm.years);
    
    const newGoal: FinancialGoal = {
      id: Math.random().toString(36).substr(2, 9),
      name: wealthGoalForm.name,
      targetValue: wealthGoalForm.value,
      currentValue: 0,
      deadline: deadlineDate.toISOString().split('T')[0]
    };
    
    setGoals(prev => [...prev, newGoal]);
    setIsWealthGoalModalOpen(false);
  };

  const totalAlloc = allocationGoals.fixedIncome + allocationGoals.variableIncome + allocationGoals.crypto;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Metas e Estratégia</h2>
          <p className="text-slate-400 text-sm">Defina seu norte financeiro.</p>
        </div>
        <button 
          onClick={() => setIsWealthGoalModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40"
        >
          <Plus size={18} /> Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Estratégia de Alocação */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-lg font-bold">Meta de Alocação (%)</h3>
            </div>
            
            <p className="text-sm text-slate-400">Quanto do seu patrimônio você deseja ter em cada classe.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                  Renda Fixa <span>{allocationGoals.fixedIncome}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" value={allocationGoals.fixedIncome} 
                  onChange={e => handleUpdateAllocation('fixedIncome', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                  Renda Variável <span>{allocationGoals.variableIncome}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" value={allocationGoals.variableIncome} 
                  onChange={e => handleUpdateAllocation('variableIncome', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                  Cripto <span>{allocationGoals.crypto}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" value={allocationGoals.crypto} 
                  onChange={e => handleUpdateAllocation('crypto', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${totalAlloc === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                 <span className="text-xs font-bold text-slate-300">Total: {totalAlloc}%</span>
               </div>
               {totalAlloc !== 100 && (
                 <span className="text-[10px] font-black uppercase text-rose-400">A soma deve ser 100%</span>
               )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white px-2">Metas Patrimoniais</h3>
            {goals.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center space-y-4">
                <div className="p-4 bg-slate-900 w-fit mx-auto rounded-3xl text-slate-700">
                  <Target size={32} />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma meta de patrimônio cadastrada.</p>
              </div>
            ) : (
              goals.map(goal => {
                const progress = (goal.currentValue / goal.targetValue) * 100;
                return (
                  <div key={goal.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Target size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1"><Calendar size={12} /> Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">R$ {goal.targetValue.toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objetivo</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-blue-400">{progress.toFixed(1)}%</span>
                        <span className="text-slate-500">R$ {goal.currentValue.toLocaleString('pt-BR')} acumulados</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Sparkles size={200} />
            </div>
            
            <div className="flex items-center gap-2 mb-8">
              <Sparkles size={20} className="text-indigo-200" />
              <h4 className="font-bold text-lg">Finanza Insights</h4>
            </div>

            {loadingInsights ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-24 bg-white/20 rounded"></div>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                {insights.insights.slice(0, 3).map((insight: any, idx: number) => (
                  <div key={idx} className="space-y-2 bg-white/10 p-5 rounded-3xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-300" />
                      <h5 className="text-sm font-bold text-white">{insight.title}</h5>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed">{insight.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded inline-block">
                      {insight.action}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <AlertCircle size={32} className="opacity-50 text-indigo-200" />
                <p className="text-xs text-indigo-100">Adicione suas metas patrimoniais para receber insights da nossa IA.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Meta de Patrimônio */}
      {isWealthGoalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-white">Criar Meta de Patrimônio</h3>
              <button onClick={() => setIsWealthGoalModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome da Meta</label>
                <input 
                  required value={wealthGoalForm.name}
                  onChange={e => setWealthGoalForm({...wealthGoalForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Ex: Independência Financeira"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quanto Reais eu quero ter?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number" required value={wealthGoalForm.value}
                    onChange={e => setWealthGoalForm({...wealthGoalForm, value: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Em quantos anos?</label>
                <input 
                  type="number" required min="1" max="50" value={wealthGoalForm.years}
                  onChange={e => setWealthGoalForm({...wealthGoalForm, years: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all active:scale-95">
                Salvar Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
