import React, { useMemo } from 'react';
import { Asset, PaymentFrequency } from '../types';

interface ReportsProps {
  assets: Asset[];
}

const Reports: React.FC<ReportsProps> = ({ assets }) => {

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

  const totalWealth = useMemo(
    () => assets.reduce((acc, a) => acc + calculateCurrentValue(a), 0),
    [assets]
  );

  const totalInvested = useMemo(
    () => assets.reduce((acc, a) => acc + a.investedAmount, 0),
    [assets]
  );

  const totalProfit = totalWealth - totalInvested;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Patrimônio</p>
          <h4 className="text-2xl font-black text-white">
            R$ {totalWealth.toLocaleString('pt-BR')}
          </h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Investido</p>
          <h4 className="text-2xl font-black text-white">
            R$ {totalInvested.toLocaleString('pt-BR')}
          </h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Lucro</p>
          <h4 className="text-2xl font-black text-white">
            R$ {totalProfit.toLocaleString('pt-BR')}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Reports;
