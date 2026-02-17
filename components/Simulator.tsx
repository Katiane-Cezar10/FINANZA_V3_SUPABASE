
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, Info } from 'lucide-react';

const Simulator: React.FC = () => {
  const [inputs, setInputs] = useState({
    invested: 10000,
    annualYield: 12,
    monthlyContribution: 500,
    years: 10,
    withDividends: true
  });

  const simulationResults = useMemo(() => {
    let current = inputs.invested;
    const monthlyRate = Math.pow(1 + inputs.annualYield / 100, 1 / 12) - 1;
    const data = [];

    for (let i = 1; i <= inputs.years; i++) {
      for (let m = 1; m <= 12; m++) {
        const yieldAmount = current * monthlyRate;
        current += yieldAmount + inputs.monthlyContribution;
      }
      data.push({
        year: `${i}a`,
        total: Math.round(current),
        invested: Math.round(inputs.invested + (inputs.monthlyContribution * 12 * i)),
        profit: Math.round(current - (inputs.invested + (inputs.monthlyContribution * 12 * i)))
      });
    }

    return {
      chartData: data,
      finalTotal: current,
      finalProfit: current - (inputs.invested + inputs.monthlyContribution * 12 * inputs.years),
      totalInvested: inputs.invested + inputs.monthlyContribution * 12 * inputs.years
    };
  }, [inputs]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Simulador de Rentabilidade</h2>
        <p className="text-slate-400 text-sm">Visualize o poder dos juros compostos no tempo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-blue-400 font-black mb-4 uppercase tracking-widest text-xs">
            <Calculator size={16} />
            Configuração
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investimento Inicial</label>
              <input 
                type="number"
                value={inputs.invested}
                onChange={e => setInputs({...inputs, invested: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800 text-white border-none ring-1 ring-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aporte Mensal</label>
              <input 
                type="number"
                value={inputs.monthlyContribution}
                onChange={e => setInputs({...inputs, monthlyContribution: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800 text-white border-none ring-1 ring-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxa Anual (%)</label>
              <input 
                type="number"
                value={inputs.annualYield}
                onChange={e => setInputs({...inputs, annualYield: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800 text-white border-none ring-1 ring-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo (Anos)</label>
                <span className="text-blue-400 font-black text-sm">{inputs.years}</span>
              </div>
              <input 
                type="range"
                min="1"
                max="40"
                value={inputs.years}
                onChange={e => setInputs({...inputs, years: Number(e.target.value)})}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Acumulado</p>
              <p className="text-2xl font-black text-white">R$ {simulationResults.finalTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Investido</p>
              <p className="text-2xl font-black text-slate-300">R$ {simulationResults.totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Lucro Bruto</p>
              <p className="text-2xl font-black text-emerald-400">R$ {simulationResults.finalProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-sm relative overflow-hidden">
            <h4 className="text-white font-black mb-8 text-sm uppercase tracking-widest">Projeção de Patrimônio</h4>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationResults.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(val) => `R$ ${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', color: '#fff'}}
                    itemStyle={{color: '#fff'}}
                    formatter={(value: any) => [`R$ ${value.toLocaleString()}`, '']}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="invested" name="Investido" stackId="a" fill="#334155" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="profit" name="Rendimento" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-5 bg-blue-900/20 border border-blue-500/20 rounded-2xl flex gap-4 text-xs text-blue-200 leading-relaxed items-center">
              <Info className="shrink-0 text-blue-400" size={20} />
              Os resultados são estimativas brutas e não consideram inflação ou impostos específicos de cada modalidade de investimento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
