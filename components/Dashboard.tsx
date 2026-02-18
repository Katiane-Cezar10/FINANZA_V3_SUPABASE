import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Asset, FinancialGoal, PaymentFrequency } from '../types';
import {
  Wallet, TrendingUp, Target,
  Sparkles, Loader2, Send, Coins,
  Trophy, Crown, Medal
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { askFinancialAssistant } from '../services/geminiService';

interface DashboardProps {
  assets: Asset[];
  goals: FinancialGoal[];
  privacyMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  assets,
  goals,
  privacyMode = false
}) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot' as const, content: 'Olá! Sou seu analista Finanza. O que deseja analisar hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages, isTyping]);

  const safeNumber = (val: any) =>
    typeof val === "number" && !isNaN(val) ? val : 0;

  const formatCurrency = (val: number) =>
    privacyMode
      ? 'R$ ••••••'
      : `R$ ${safeNumber(val).toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}`;

  const dashboardMetrics = useMemo(() => {
    const today = new Date();

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalMaturityValue = 0;
    let totalDividendsReceived = 0;
    let totalDividendsProjected = 0;

    const assetsPerformance = assets.map(asset => {
      const invested = safeNumber(asset.investedAmount);
      const yieldRate = safeNumber(asset.yieldRate);
      const dividendYield = safeNumber(asset.dividendYield);

      const allocDate = asset.allocationDate
        ? new Date(asset.allocationDate)
        : today;

      const maturityDate = asset.maturityDate
        ? new Date(asset.maturityDate)
        : today;

      const monthsElapsed = Math.max(
        0,
        (today.getFullYear() - allocDate.getFullYear()) * 12 +
          (today.getMonth() - allocDate.getMonth())
      );

      const totalMonths = Math.max(
        1,
        (maturityDate.getFullYear() - allocDate.getFullYear()) * 12 +
          (maturityDate.getMonth() - allocDate.getMonth())
      );

      const monthlyRate = Math.pow(1 + yieldRate / 100, 1 / 12) - 1;

      const isCompound =
        asset.paymentFrequency === PaymentFrequency.AT_MATURITY;

      const currentVal = isCompound
        ? invested * Math.pow(1 + monthlyRate, monthsElapsed)
        : invested * (1 + monthlyRate * monthsElapsed);

      const valAtMaturity = isCompound
        ? invested * Math.pow(1 + monthlyRate, totalMonths)
        : invested * (1 + monthlyRate * totalMonths);

      totalInvested += invested;
      totalCurrentValue += currentVal;
      totalMaturityValue += valAtMaturity;

      const monthlyDivRate = dividendYield / 100 / 12;

      totalDividendsReceived += invested * monthlyDivRate * monthsElapsed;
      totalDividendsProjected +=
        invested *
        monthlyDivRate *
        Math.max(0, totalMonths - monthsElapsed);

      const profitPercent =
        invested > 0
          ? ((valAtMaturity - invested) / invested) * 100
          : 0;

      return {
        ...asset,
        profitPercent,
        currentVal,
        totalProfitProj: valAtMaturity - invested
      };
    });

    const ranking = [...assetsPerformance]
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, 3);

    return {
      totalInvested,
      totalCurrentValue,
      totalMaturityValue,
      totalDividendsReceived,
      totalDividendsProjected,
      currentProfit: totalCurrentValue - totalInvested,
      profitPercent:
        totalInvested > 0
          ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
          : 0,
      ranking
    };
  }, [assets]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const response = await askFinancialAssistant(
      userMsg,
      assets,
      goals
    );

    setIsTyping(false);
    setMessages(prev => [
      ...prev,
      { role: 'bot', content: response || 'Erro ao processar.' }
    ]);
  };

  const chartData = [
    {
      name: 'Investido',
      value: safeNumber(dashboardMetrics.totalInvested)
    },
    {
      name: 'Atual',
      value: safeNumber(dashboardMetrics.totalCurrentValue)
    },
    {
      name: 'Final',
      value: safeNumber(dashboardMetrics.totalMaturityValue)
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase">Patrimônio</p>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(dashboardMetrics.totalCurrentValue)}
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase">
            Lucro Projetado
          </p>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(
              dashboardMetrics.totalMaturityValue -
                dashboardMetrics.totalCurrentValue
            )}
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase">
            Dividendos Totais
          </p>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(
              dashboardMetrics.totalDividendsReceived +
                dashboardMetrics.totalDividendsProjected
            )}
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase">
            Rentabilidade Média
          </p>
          <h3 className="text-2xl font-bold text-white">
            {assets.length > 0
              ? (
                  assets.reduce(
                    (a, b) => a + safeNumber(b.yieldRate),
                    0
                  ) / assets.length
                ).toFixed(1)
              : 0}
            % a.a.
          </h3>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#475569"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
