
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Asset, FinancialGoal, AssetType, PaymentFrequency } from '../types';
import { 
  Wallet, TrendingUp, Target, ArrowUpRight, 
  Sparkles, Loader2, Send, History, Coins, Trophy, 
  Crown, Medal, ArrowRightCircle, HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { askFinancialAssistant } from '../services/geminiService';

interface DashboardProps {
  assets: Asset[];
  goals: FinancialGoal[];
  privacyMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ assets, goals, privacyMode = false }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', content: string }[]>([
    { role: 'bot', content: 'Olá! Sou seu analista Finanza. O que deseja analisar hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isTyping]);

  const formatCurrency = (val: number) => privacyMode ? 'R$ ••••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const dashboardMetrics = useMemo(() => {
    const today = new Date();
    let totalInvested = 0, totalCurrentValue = 0, totalMaturityValue = 0;
    let totalDividendsReceived = 0, totalDividendsProjected = 0;

    const assetsPerformance = assets.map(asset => {
      const allocDate = new Date(asset.allocationDate);
      const maturityDate = new Date(asset.maturityDate);
      const monthsElapsed = Math.max(0, (today.getFullYear() - allocDate.getFullYear()) * 12 + (today.getMonth() - allocDate.getMonth()));
      const totalMonths = Math.max(1, (maturityDate.getFullYear() - allocDate.getFullYear()) * 12 + (maturityDate.getMonth() - allocDate.getMonth()));
      
      const monthlyRate = Math.pow(1 + asset.yieldRate / 100, 1 / 12) - 1;
      const isCompound = asset.paymentFrequency === PaymentFrequency.AT_MATURITY;
      
      const currentVal = isCompound 
        ? asset.investedAmount * Math.pow(1 + monthlyRate, monthsElapsed)
        : asset.investedAmount * (1 + monthlyRate * monthsElapsed);
      
      const valAtMaturity = isCompound
        ? asset.investedAmount * Math.pow(1 + monthlyRate, totalMonths)
        : asset.investedAmount * (1 + monthlyRate * totalMonths);

      totalInvested += asset.investedAmount;
      totalCurrentValue += currentVal;
      totalMaturityValue += valAtMaturity;

      const monthlyDivRate = (asset.dividendYield || 0) / 100 / 12;
      totalDividendsReceived += asset.investedAmount * monthlyDivRate * monthsElapsed;
      totalDividendsProjected += asset.investedAmount * monthlyDivRate * Math.max(0, totalMonths - monthsElapsed);

      const profitPercent = asset.investedAmount > 0 ? ((valAtMaturity - asset.investedAmount) / asset.investedAmount) * 100 : 0;

      return { ...asset, profitPercent, currentVal, totalProfitProj: valAtMaturity - asset.investedAmount };
    });

    const ranking = [...assetsPerformance].sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 3);

    return {
      totalInvested, totalCurrentValue, totalMaturityValue,
      totalDividendsReceived, totalDividendsProjected,
      currentProfit: totalCurrentValue - totalInvested,
      profitPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
      ranking
    };
  }, [assets]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsTyping(true);
    const response = await askFinancialAssistant(userMsg, assets, goals);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'bot', content: response || 'Erro ao processar.' }]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl"><Wallet size={20} /></div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${dashboardMetrics.currentProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {dashboardMetrics.profitPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Patrimônio</p>
          <h3 className="text-2xl font-black text-white">{formatCurrency(dashboardMetrics.totalCurrentValue)}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="p-2.5 bg-purple-600/10 text-purple-400 rounded-xl w-fit mb-4"><TrendingUp size={20} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Lucro Projetado</p>
          <h3 className="text-2xl font-black text-white">{formatCurrency(dashboardMetrics.totalMaturityValue - dashboardMetrics.totalCurrentValue)}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl w-fit mb-4"><Coins size={20} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Dividendos Totais</p>
          <h3 className="text-2xl font-black text-white">{formatCurrency(dashboardMetrics.totalDividendsReceived + dashboardMetrics.totalDividendsProjected)}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="p-2.5 bg-amber-600/10 text-amber-400 rounded-xl w-fit mb-4"><Target size={20} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Rentabilidade Média</p>
          <h3 className="text-2xl font-black text-white">
            {assets.length > 0 ? (assets.reduce((a, b) => a + b.yieldRate, 0) / assets.length).toFixed(1) : 0}% <span className="text-xs text-slate-500">a.a.</span>
          </h3>
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-amber-400" size={24} />
          <h4 className="text-white font-black uppercase tracking-widest text-sm">Top Performance</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardMetrics.ranking.map((asset, idx) => {
            const Icons = [Crown, Medal, Medal];
            const Colors = ["text-amber-400", "text-slate-300", "text-amber-700"];
            const Icon = Icons[idx];
            return (
              <div key={asset.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative group">
                <Icon className={`absolute top-4 right-4 ${Colors[idx]}`} size={20} />
                <p className="text-[10px] font-bold text-slate-500 uppercase">{asset.subtype}</p>
                <h5 className="text-white font-black mt-1 truncate">{asset.name}</h5>
                <p className="text-2xl font-black text-emerald-400 mt-4">+{asset.profitPercent.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Investido', value: dashboardMetrics.totalInvested },
                { name: 'Atual', value: dashboardMetrics.totalCurrentValue },
                { name: 'Final', value: dashboardMetrics.totalMaturityValue }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chat Analítico */}
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={18} />
            <span className="text-xs font-black text-white uppercase tracking-widest">Analista Finanza</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && <Loader2 className="animate-spin text-blue-500 mx-auto" size={16} />}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-slate-950/50">
            <div className="relative">
              <input 
                type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte sobre rentabilidade..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><Send size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
