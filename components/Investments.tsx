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

const safeNumber = (value: any) => {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

const formatCurrency = (value: any) => {
  const safe = safeNumber(value);
  return `R$ ${safe.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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
    const invested = safeNumber(asset.investedAmount);
    const rate = safeNumber(asset.yieldRate);

    const today = new Date();
    const allocDate = new Date(asset.allocationDate);
    const months = (today.getFullYear() - allocDate.getFullYear()) * 12 + (today.getMonth() - allocDate.getMonth());

    if (months <= 0) return invested;

    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
    const isCompound = asset.paymentFrequency === PaymentFrequency.AT_MATURITY;
    
    return isCompound 
      ? invested * Math.pow(1 + monthlyRate, months)
      : invested * (1 + monthlyRate * months);
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
    const isOk = Math.abs(diff) < 3;
    
    return (
      <div className={`p-6 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-lg`}>
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 ${
            isOk ? 'bg-emerald-500/10 text-emerald-400' : 
            diff > 0 ? 'bg-rose-500/10 text-rose-400' : 
            'bg-amber-500/10 text-amber-400'
          }`}>
            {isOk ? <Check size={12} /> : diff > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {isOk ? 'Na Meta' : diff > 0 ? 'Acima' : 'Abaixo'}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <h4 className="text-3xl font-black text-white">{safeNumber(current).toFixed(1)}%</h4>
          <span className="text-xs text-slate-500 font-bold italic">Meta: {target}%</span>
        </div>
      </div>
    );
  };

  const Section = ({ title, data }: { title: string, data: Asset[] }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(asset => {
          const currentVal = calculateCurrentValue(asset);
          const invested = safeNumber(asset.investedAmount);

          return (
            <div key={asset.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase text-blue-400">
                  {asset.subtype}
                </span>
                <h4 className="font-bold text-white mt-2 text-lg">
                  {asset.name}
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-500">Patrimônio Atual</span>
                    <div className="font-black text-white text-xl">
                      {formatCurrency(currentVal)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Investido</span>
                    <div className="text-sm font-bold text-slate-400">
                      {formatCurrency(invested)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>Taxa: {safeNumber(asset.yieldRate)}%</span>
                  <span>
                    {asset.maturityDate
                      ? new Date(asset.maturityDate).toLocaleDateString('pt-BR')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Seus Investimentos</h2>
        <button 
          onClick={onAddClick}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Novo Ativo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AllocationCard title="Renda Fixa" current={currentAllocation.fixedIncome} target={allocationGoals.fixedIncome} colorClass="bg-blue-600" />
        <AllocationCard title="Renda Variável" current={currentAllocation.variableIncome} target={allocationGoals.variableIncome} colorClass="bg-emerald-600" />
        <AllocationCard title="Cripto" current={currentAllocation.crypto} target={allocationGoals.crypto} colorClass="bg-purple-600" />
      </div>

      <Section title="Renda Fixa" data={fixedIncome} />
      <Section title="Renda Variável" data={variableIncome} />
      <Section title="Cripto" data={cryptoAssets} />

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
