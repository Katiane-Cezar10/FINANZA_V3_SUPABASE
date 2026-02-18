import { Asset, FinancialGoal } from './types';

export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_GOALS: FinancialGoal[] = [];

// Função global segura para moeda
export const formatCurrency = (value: any) => {
  const safe =
    typeof value === "number" && !isNaN(value)
      ? value
      : 0;

  return `R$ ${safe.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
