
import React, { useMemo, useState } from 'react';
import { Asset, AssetType, PaymentFrequency, YieldIndicator } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  FileText, Download, TrendingUp, PieChart as PieIcon, 
  Calendar, DollarSign, ArrowUpRight, ShieldCheck, 
  Mail, MessageCircle, Filter, ChevronDown, Share2, Target,
  AlertCircle
} from 'lucide-react';

interface ReportsProps {
  assets: Asset[];
}

type Period = 'mensal' | 'anual' | 'ytd';

const Reports: React.FC<ReportsProps> = ({ assets }) => {
  const [filterPeriod, setFilterPeriod] = useState<Period>('anual');

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

  const totalWealth = useMemo(() => assets.reduce((acc, a) => acc + calculateCurrentValue(a), 0), [assets]);
  const totalInvested = useMemo(() => assets.reduce((acc, a) => acc + a.investedAmount, 0), [assets]);

  // Alocação por Indexador (Apenas Renda Fixa)
  const indicatorData = useMemo(() => {
    const map = new Map<string, number>();
    const fixedAssets = assets.filter(a => a.type === AssetType.FIXED_INCOME);
    
    fixedAssets.forEach(a => {
      const val = calculateCurrentValue(a);
      const indicator = a.indicator || YieldIndicator.OUTROS;
      map.set(indicator, (map.get(indicator) || 0) + val);
    });
    
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [assets]);

  // Composição por Subtipo
  const subtypeData = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach(a => {
      const val = calculateCurrentValue(a);
      map.set(a.subtype, (map.get(a.subtype) || 0) + val);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  const INDICATOR_COLORS: Record<string, string> = {
    [YieldIndicator.CDI]: '#3b82f6',    // Azul
    [YieldIndicator.IPCA]: '#10b981',   // Verde
    [YieldIndicator.SELIC]: '#f59e0b',  // Amarelo/Laranja
    [YieldIndicator.PRE]: '#ef4444',    // Vermelho
    [YieldIndicator.OUTROS]: '#64748b'  // Cinza
  };

  const totalProfit = totalWealth - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Relatório Consolidado de Patrimônio - Finanza");
    const body = encodeURIComponent(
      `Olá, aqui está o resumo do meu patrimônio atual:\n\n` +
      `Patrimônio Líquido: R$ ${totalWealth.toLocaleString('pt-BR')}\n` +
      `Rentabilidade Global: ${profitPercentage.toFixed(2)}%\n` +
      `Ativos Cadastrados: ${assets.length}\n\n` +
      `Gerado via Finanza App.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*Resumo de Patrimônio - Finanza*\n\n` +
      `💰 *Patrimônio:* R$ ${totalWealth.toLocaleString('pt-BR')}\n` +
      `📈 *Rentabilidade:* ${profitPercentage.toFixed(2)}%\n` +
      `📊 *Ativos:* ${assets.length}\n\n` +
      `_Enviado via Finanza App_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 space-y-6">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
          <FileText size={64} className="opacity-10 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Relatórios Indisponíveis</h3>
          <p className="max-w-xs text-sm">Adicione ativos na aba de investimentos para gerar relatórios detalhados do seu patrimônio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:bg-white print:text-black">
      {/* Header do Relatório */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Relatório Consolidado</h2>
          <p className="text-slate-400 text-sm">Análise profunda da performance e diversificação da sua carteira.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {(['mensal', 'anual', 'ytd'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  filterPeriod === p 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="p-3 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2"
              title="Exportar PDF"
            >
              <Download size={18} />
              <span className="text-xs font-bold md:hidden lg:inline">PDF</span>
            </button>
            <button 
              onClick={handleEmailShare}
              className="p-3 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2"
              title="Enviar por E-mail"
            >
              <Mail size={18} />
              <span className="text-xs font-bold md:hidden lg:inline">E-mail</span>
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="p-3 bg-emerald-600/10 text-emerald-400 rounded-2xl border border-emerald-600/20 hover:bg-emerald-600/20 transition-all flex items-center gap-2"
              title="Compartilhar WhatsApp"
            >
              <MessageCircle size={18} />
              <span className="text-xs font-bold md:hidden lg:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 print:border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Patrimônio Líquido</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-white print:text-black">R$ {totalWealth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h4>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl print:hidden">
              <DollarSign size={18} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 print:border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Retorno Total</p>
          <div className="flex items-center justify-between">
            <h4 className={`text-2xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>
              R$ {totalProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h4>
            <div className={`p-2 rounded-xl print:hidden ${totalProfit >= 0 ? 'bg-emerald-600/10 text-emerald-400' : 'bg-rose-600/10 text-rose-400'}`}>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 print:border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rentabilidade Global</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-white print:text-black">{profitPercentage.toFixed(2)}%</h4>
            <div className="p-2 bg-purple-600/10 text-purple-400 rounded-xl print:hidden">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 print:border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Proteção FGC</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-white print:text-black">
              {((assets.filter(a => a.fgcGarranty).length / assets.length) * 100).toFixed(0)}%
            </h4>
            <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-xl print:hidden">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza por Indexador - SUBSTUIÇÃO DO GRÁFICO DE RENDIMENTOS */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm print:border-slate-200 print:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl print:hidden">
              <Target size={20} />
            </div>
            <h3 className="font-black text-white text-lg print:text-black">Alocação por Indexador (Renda Fixa)</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[250px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={indicatorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {indicatorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INDICATOR_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155'}}
                    itemStyle={{color: '#fff'}}
                    formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {indicatorData.length > 0 ? indicatorData.sort((a,b) => b.value - a.value).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: INDICATOR_COLORS[item.name] || COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-400 font-bold print:text-black">{item.name}</span>
                  </div>
                  <span className="text-white font-black print:text-black">
                    {((item.value / indicatorData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                   <AlertCircle size={24} className="text-slate-700" />
                   <p className="text-slate-500 text-xs italic">Nenhum ativo de Renda Fixa com indexador para exibir.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diversificação por Subtipo */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm print:border-slate-200 print:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl print:hidden">
              <PieIcon size={20} />
            </div>
            <h3 className="font-black text-white text-lg print:text-black">Concentração por Subclasse</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[250px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subtypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {subtypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155'}}
                    itemStyle={{color: '#fff'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {subtypeData.sort((a,b) => b.value - a.value).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-400 font-bold print:text-black truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-white font-black print:text-black">{((item.value / totalWealth) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Performance Detalhada */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm overflow-hidden print:border-slate-200 print:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-white text-lg print:text-black">Performance Detalhada</h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter size={12} /> Filtro: {filterPeriod}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 print:border-slate-200">
                <th className="pb-4">Ativo</th>
                <th className="pb-4 text-center">Taxa a.a.</th>
                <th className="pb-4 text-right">Saldo Atual</th>
                <th className="pb-4 text-right">Resultado</th>
                <th className="pb-4 text-right">% Carteira</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
              {assets.sort((a,b) => calculateCurrentValue(b) - calculateCurrentValue(a)).map(asset => {
                const currentVal = calculateCurrentValue(asset);
                const profit = currentVal - asset.investedAmount;
                const weight = (currentVal / totalWealth) * 100;
                
                return (
                  <tr key={asset.id} className="group hover:bg-slate-800/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white print:text-black">{asset.name}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{asset.subtype}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-blue-400 print:text-black">{asset.yieldRate}%</td>
                    <td className="py-4 text-right font-bold text-white print:text-black">R$ {currentVal.toLocaleString('pt-BR')}</td>
                    <td className={`py-4 text-right font-black ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>
                      {profit >= 0 ? '+' : ''}R$ {Math.abs(profit).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 text-right">
                       <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 print:bg-slate-100 print:text-black">
                         {weight.toFixed(1)}%
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
