
export enum AssetType {
  FIXED_INCOME = 'Renda Fixa',
  VARIABLE_INCOME = 'Renda Variável',
  CRYPTO = 'Cripto'
}

export enum AssetSubtype {
  CRI = 'CRI',
  CRA = 'CRA',
  CDB = 'CDB',
  LCI = 'LCI',
  LCA = 'LCA',
  TESOURO = 'Tesouro',
  ACAO = 'Ações',
  FII = 'Fundos Imobiliários',
  ETF = 'ETFs',
  CRYPTO = 'Criptomoedas',
  BITCOIN = 'Bitcoin',
  ETHEREUM = 'Ethereum',
  OUTROS = 'Outros'
}

export enum YieldIndicator {
  CDI = 'CDI',
  IPCA = 'IPCA',
  SELIC = 'SELIC',
  PRE = 'Pré-fixado',
  OUTROS = 'Outros'
}

export enum PaymentFrequency {
  MONTHLY = 'Mensal',
  QUARTERLY = 'Trimestral',
  SEMIANNUALLY = 'Semestral',
  ANNUALLY = 'Anual',
  AT_MATURITY = 'No Vencimento'
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  subtype: AssetSubtype;
  yieldRate: number; // Annual %
  investedAmount: number;
  allocationDate: string; // YYYY-MM-DD
  maturityDate: string;
  paymentFrequency: PaymentFrequency;
  dividendYield?: number; // Annual %
  incomeTax: 'Isento' | number; // Percent
  adminFee: number;
  performanceFee: number;
  fgcGarranty: boolean;
  indicator?: YieldIndicator;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetValue: number;
  deadline: string;
  currentValue: number;
}

export interface AllocationGoals {
  fixedIncome: number;
  variableIncome: number;
  crypto: number;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
}
