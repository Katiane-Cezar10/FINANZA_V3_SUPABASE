import React, { useMemo } from 'react';
import { Asset, AssetType, PaymentFrequency, YieldIndicator } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../constants';

interface ReportsProps {
  assets: Asset[];
}

const Reports: React.FC<ReportsProps> = ({ assets }) => {

  const calculateCurrentValue = (asset: Asset) => {
    const today = new Date();
    const allocDate = new Date(asset.allocationDate);
    const months = (today.getFullYear() - allocDate.getFullYear()) * 12 + (today.getMonth() - allocDate.getMonth());
    if (months <= 0) return asset.investedAmount || 0;
    
    const rate = asset.yieldRate || 0;
    const invested = asset.investedAmount || 0;

    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
    const isCompound = asset.paymentFrequency === PaymentFrequency.AT_MATURITY;
    
    return isCompound 
      ? invested * Math.pow(1 + monthlyRate, months)
      : invested * (1 + monthlyRate * months);
  };

  const totalWealth = useMemo(
    () => assets.reduce((acc, a) => acc + calculateCurrentValue(a), 0),
    [assets]
  );

  const totalInvested = useMemo(
    () => assets.reduce((acc, a) => acc + (a.investedAmount || 0), 0),
    [assets]
  );

  const totalProfit = totalWealth - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const subtypeData = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach(a => {
      const val = calculateCurrentValue(a);
      map.set(a.subtype, (map.get(a.subtype) || 0) + val);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Patrimônio</p>
          <h4 className="text-2xl font-black text-white">
            {formatCurrency(totalWealth)}
          </h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Lucro</p>
          <h4 className="text-2xl font-black text-white">
            {formatCurrency(totalProfit)}
          </h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-xs text-slate-500">Rentabilidade</p>
          <h4 className="text-2xl font-black text-white">
            {profitPercentage.toFixed(2)}%
          </h4>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
        <h3 className="text-white font-bold mb-6">Composição por Subtipo</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={subtypeData} dataKey="value">
                {subtypeData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
