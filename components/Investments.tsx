
import React, { useState } from 'react';
import { Asset, AssetType, AllocationGoals, PaymentFrequency } from '../types';
import { Plus, Shield, Calendar, Percent, Landmark, Sparkles, Edit2, Trash2, Copy, History, ArrowUp, ArrowDown, Check, AlertTriangle } from 'lucide-react';
import ChatImportModal from './ChatImportModal';

interface InvestmentsProps {
  assets: Asset[];
  allocationGoals: AllocationGoals;
  onAddClick: () => void;
  onAIImport: (data: Partial<Asset>) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onDuplicateAsset: (asset: Asset) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ 
  assets, 
  allocationGoals,
  onAddClick, 
  onAIImport, 
  onEditAsset, 
  onDeleteAsset, 
  onDuplicateAsset 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const calculateCurrentValue = (asset: Asset) => {
    const today = new Date();
    const allocDate = new Date(asset.allocationDate);
    const months = (today.getFullYear() - allocDate.getFullYear()) * 12 + (today.getMonth() - allocDate.getMonth());
    if (months <= 0) return asset.investedAmount;
    
    const monthlyRate = Math.pow(1 + asset.yieldRate / 100, 1 / 12) - 1;
    const isCompound = asset.paymentFrequency === PaymentFrequency.AT_MATURITY;
    
    return isCompound 
      ? asset.investedAmount * Math.pow(1 + monthlyRate, months)
      : asset.investedAmount * (1 + monthlyRate * months);
  };

  const fixedIncome = assets.filter(a => a.type === AssetType.FIXED_INCOME);
  const variableIncome = assets.filter(a => a.type === AssetType.VARIABLE_INCOME);
  const cryptoAssets = assets.filter(a => a.type === AssetType.CRYPTO);

  const totalWealth = assets.reduce((acc, curr) => acc + calculateCurrentValue(curr), 0);
  
  const currentAllocation = {
    fixedIncome: totalWealth > 0 ? (fixedIncome.reduce((acc, curr) => acc + calculateCurrentValue(curr), 0) / totalWealth) * 100 : 0,
    variableIncome: totalWealth > 0 ? (variableIncome.reduce((acc, curr) => acc + calculateCurrentValue(curr), 0) / totalWealth) * 100 : 0,
    crypto: totalWealth > 0 ? (cryptoAssets.reduce((acc, curr) => acc + calculateCurrentValue(curr), 0) / totalWealth) * 100 : 0
  };

  const AllocationCard = ({ title, current, target, colorClass }: { title: string, current: number, target: number, colorClass: string }) => {
    const diff = current - target;
    const isOk = Math.abs(diff) < 3; // tolerância de 3%
    
    return (
      <div className={`p-6 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${colorClass}`}></div>
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 ${
            isOk ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
            diff > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isOk ? <Check size={12} /> : diff > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {isOk ? 'Na Meta' : diff > 0 ? 'Acima' : 'Abaixo'}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <h4 className="text-3xl font-black text-white">{current.toFixed(1)}%</h4>
          <span className="text-xs text-slate-500 font-bold italic">Meta: {target}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-700 ease-out`} style={{ width: `${current}%` }}></div>
        </div>
        {Math.abs(diff) > 5 && !isOk && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
            <AlertTriangle size={12} className={diff > 0 ? 'text-rose-400' : 'text-amber-400'} />
            Desvio de {Math.abs(diff).toFixed(1)}% detectado
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, data }: { title: string, data: Asset[] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {title}
          <span className="text-xs font-medium text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">{data.length}</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(asset => {
          const currentVal = calculateCurrentValue(asset);
          return (
            <div key={asset.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
                    {asset.subtype}
                  </span>
                  <h4 className="font-bold text-white mt-2 text-lg truncate max-w-[150px]">{asset.name}</h4>
                </div>
                <div className="flex gap-1">
                  {asset.fgcGarranty && (
                    <div title="Garantia FGC" className="text-emerald-400 bg-emerald-400/10 p-1.5 rounded-xl h-fit">
                      <Shield size={14} />
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
                    <button 
                      onClick={() => onEditAsset(asset)}
                      className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDuplicateAsset(asset)}
                      className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-2 hover:bg-rose-600/20 text-rose-400 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">Patrimônio Atual</span>
                    <span className="font-black text-white text-xl">R$ {currentVal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Investido</span>
                    <span className="text-sm font-bold text-slate-400">R$ {asset.investedAmount.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <History size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Alocado em</span>
                      <span className="text-xs font-bold text-slate-200">{new Date(asset.allocationDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Percent size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Taxa Anual</span>
                      <span className="text-xs font-bold text-slate-200">{asset.yieldRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Landmark size={14} className="opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      Dividendos: {asset.paymentFrequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">Vence {new Date(asset.maturityDate).toLocaleDateString('pt-BR', {month: 'short', year: 'numeric'})}</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-16 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 border border-slate-800 border-dashed rounded-[2rem] hover:bg-slate-900/70 transition-colors">
            <Landmark size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">Nenhum ativo de {title.toLowerCase()} cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Seus Investimentos</h2>
          <p className="text-slate-400 text-sm">Gerencie seu patrimônio e acompanhe o balanceamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-slate-900/50 text-indigo-400 px-6 py-3.5 rounded-[1.5rem] font-bold flex items-center gap-2.5 hover:bg-slate-800 transition-all border border-slate-800 shadow-lg group"
          >
            <Sparkles size={18} className="group-hover:animate-pulse" /> Chat IA
          </button>
          <button 
            onClick={onAddClick}
            className="bg-blue-600 text-white px-7 py-3.5 rounded-[1.5rem] font-black flex items-center gap-2.5 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
          >
            <Plus size={22} /> Novo Ativo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AllocationCard title="Renda Fixa" current={currentAllocation.fixedIncome} target={allocationGoals.fixedIncome} colorClass="bg-blue-600" />
        <AllocationCard title="Renda Variável" current={currentAllocation.variableIncome} target={allocationGoals.variableIncome} colorClass="bg-emerald-600" />
        <AllocationCard title="Cripto" current={currentAllocation.crypto} target={allocationGoals.crypto} colorClass="bg-purple-600" />
      </div>

      <div className="space-y-12 pt-4">
        <Section title="Renda Fixa" data={fixedIncome} />
        <Section title="Renda Variável" data={variableIncome} />
        <Section title="Cripto" data={cryptoAssets} />
      </div>

      {isChatOpen && (
        <ChatImportModal 
          onClose={() => setIsChatOpen(false)} 
          onProcessed={(data) => {
            setIsChatOpen(false);
            onAIImport(data);
          }}
        />
      )}
    </div>
  );
};

export default Investments;
