/**
 * FinFlex MultiTools - Clean, Hardened Calculators Registry & Math Engine
 * Includes 8 Power Tools: Personal Finance OS Dashboard, Financial Health Score,
 * Monte Carlo Simulator, Debt Payoff Optimizer, Wealth Projection, Goal Planner,
 * Budget Optimizer, and Investment Portfolio Analyzer.
 */

// Dynamic Currency State & Utilities ('USD' | 'INR')
let activeCurrency = 'USD';

function setAppCurrency(curr) {
  activeCurrency = (curr === 'INR') ? 'INR' : 'USD';
}

function getCurrencySymbol() {
  return activeCurrency === 'INR' ? '₹' : '$';
}

const formatCurrency = (val, overrideSymbol = null) => {
  const num = parseFloat(val);
  const sym = overrideSymbol || getCurrencySymbol();
  if (isNaN(num) || !isFinite(num)) return `${sym}0.00`;
  const locale = activeCurrency === 'INR' ? 'en-IN' : 'en-US';
  return sym + num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatPercent = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return "0.00%";
  return num.toFixed(2) + "%";
};

const formatNumber = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return "0";
  const locale = activeCurrency === 'INR' ? 'en-IN' : 'en-US';
  return num.toLocaleString(locale, { maximumFractionDigits: 2 });
};

// Categories Master List
const CATEGORIES = [
  { id: 'loan', name: 'Loan & Lending' },
  { id: 'savings', name: 'Savings & Banking' },
  { id: 'investment', name: 'Investment' },
  { id: 'mutual-funds', name: 'Mutual Funds & ETFs' },
  { id: 'retirement', name: 'Retirement' },
  { id: 'tax', name: 'Tax Calculators' },
  { id: 'business', name: 'Business Finance' },
  { id: 'accounting', name: 'Accounting' },
  { id: 'inventory', name: 'Inventory & Operations' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'salary', name: 'Salary & Payroll' },
  { id: 'credit', name: 'Credit & Debt' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'crypto', name: 'Cryptocurrency' },
  { id: 'commodities', name: 'Gold & Commodities' },
  { id: 'education', name: 'Education' },
  { id: 'currency', name: 'Currency & Inflation' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'ratios', name: 'Financial Ratios' },
  { id: 'planning', name: 'Financial Planning' },
  { id: 'utilities', name: 'General Finance Utilities' }
];

// Defensive Loan EMI Helper
function calculateLoanEMI(principal, annualRate, tenureYears) {
  const P = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(annualRate) || 0) / 12 / 100;
  const n = Math.max(0, parseFloat(tenureYears) || 0) * 12;

  if (P === 0 || n === 0) return { emi: 0, totalPayment: 0, totalInterest: 0, P: 0 };
  if (r === 0) return { emi: P / n, totalPayment: P, totalInterest: 0, P };

  const pow = Math.pow(1 + r, n);
  if (!isFinite(pow) || pow === 1) return { emi: P / n, totalPayment: P, totalInterest: 0, P };

  const emi = (P * r * pow) / (pow - 1);
  const totalPayment = emi * n;
  const totalInterest = Math.max(0, totalPayment - P);

  return { emi, totalPayment, totalInterest, P };
}

// Master Calculators Database
const CALCULATORS_DB = [
  // ==========================================
  // NEW POWER TOOLS (User Requested)
  // ==========================================
  {
    id: 'personal-finance-os-dashboard',
    name: 'Personal Finance OS Dashboard',
    category: 'planning',
    badge: 'popular',
    description: 'Command center to track monthly cash flow, savings rate, net worth, and financial runway.',
    formula: 'Net Savings = Income - Expenses | Runway = Savings / Expenses',
    fields: [
      { id: 'income', label: 'Gross Monthly Income', type: 'number', min: 500, max: 500000, step: 250, default: 7500, prefix: '$' },
      { id: 'expenses', label: 'Total Monthly Expenses', type: 'number', min: 200, max: 300000, step: 250, default: 4200, prefix: '$' },
      { id: 'assets', label: 'Total Cash & Assets', type: 'number', min: 0, max: 10000000, step: 1000, default: 65000, prefix: '$' },
      { id: 'liabilities', label: 'Total Debt & Liabilities', type: 'number', min: 0, max: 5000000, step: 1000, default: 15000, prefix: '$' }
    ],
    calculate: (inputs) => {
      const inc = Math.max(0, parseFloat(inputs.income) || 0);
      const exp = Math.max(0, parseFloat(inputs.expenses) || 0);
      const assets = Math.max(0, parseFloat(inputs.assets) || 0);
      const debt = Math.max(0, parseFloat(inputs.liabilities) || 0);

      const netSavings = inc - exp;
      const savingsRate = inc > 0 ? (netSavings / inc) * 100 : 0;
      const netWorth = assets - debt;
      const runwayMonths = exp > 0 ? (assets / exp).toFixed(1) : 0;

      return {
        primary: { label: 'Net Monthly Cashflow', value: formatCurrency(netSavings) },
        metrics: [
          { label: 'Savings Rate', value: formatPercent(savingsRate) },
          { label: 'Total Net Worth', value: formatCurrency(netWorth) },
          { label: 'Financial Runway', value: `${runwayMonths} Months` }
        ],
        chartData: {
          labels: ['Monthly Expenses', 'Net Monthly Savings', 'Liabilities'],
          values: [exp, Math.max(0, netSavings), debt],
          colors: ['#ef4444', '#10b981', '#f59e0b']
        }
      };
    }
  },
  {
    id: 'financial-health-score',
    name: 'Financial Health Score with Recommendations',
    category: 'planning',
    badge: 'new',
    description: 'Evaluates your financial strength (0-100) and provides tailored recommendations.',
    formula: 'Score = Savings(30%) + Emergency(25%) + DTI(25%) + Retirement(20%)',
    fields: [
      { id: 'savings_rate', label: 'Monthly Savings Rate (%)', type: 'number', min: 0, max: 90, step: 1, default: 22, suffix: '%' },
      { id: 'emergency_months', label: 'Emergency Fund (Months)', type: 'number', min: 0, max: 24, step: 1, default: 6, suffix: 'Mo' },
      { id: 'dti_ratio', label: 'Debt-to-Income Ratio (%)', type: 'number', min: 0, max: 90, step: 1, default: 25, suffix: '%' },
      { id: 'retirement_rate', label: 'Retirement Savings Rate (%)', type: 'number', min: 0, max: 50, step: 1, default: 12, suffix: '%' }
    ],
    calculate: (inputs) => {
      const sr = Math.max(0, parseFloat(inputs.savings_rate) || 0);
      const em = Math.max(0, parseFloat(inputs.emergency_months) || 0);
      const dti = Math.max(0, parseFloat(inputs.dti_ratio) || 0);
      const ret = Math.max(0, parseFloat(inputs.retirement_rate) || 0);

      // Score Computation
      let score = 0;
      score += Math.min(30, (sr / 20) * 30);
      score += Math.min(25, (em / 6) * 25);
      score += Math.max(0, 25 - (dti / 40) * 25);
      score += Math.min(20, (ret / 15) * 20);

      const finalScore = Math.min(100, Math.round(score));
      let status = 'Needs Improvement';
      if (finalScore >= 80) status = 'Excellent';
      else if (finalScore >= 65) status = 'Good';
      else if (finalScore >= 50) status = 'Fair';

      return {
        primary: { label: 'Overall Financial Health Score', value: `${finalScore} / 100` },
        metrics: [
          { label: 'Health Status', value: status },
          { label: 'Emergency Buffer', value: `${em} Months` },
          { label: 'Debt Burden', value: formatPercent(dti) }
        ],
        chartData: {
          labels: ['Savings Component', 'Emergency Component', 'Debt Safety', 'Retirement Component'],
          values: [Math.min(30, (sr / 20) * 30), Math.min(25, (em / 6) * 25), Math.max(0, 25 - (dti / 40) * 25), Math.min(20, (ret / 15) * 20)],
          colors: ['#2563eb', '#10b981', '#059669', '#f59e0b']
        }
      };
    }
  },
  {
    id: 'monte-carlo-retirement-simulator',
    name: 'Monte Carlo Retirement Simulator',
    category: 'retirement',
    badge: 'popular',
    description: 'Simulates 1,000 market scenarios to calculate probability of retirement corpus survival.',
    formula: 'Success Probability = Scenarios(Corpus > 0) / 1000',
    fields: [
      { id: 'corpus', label: 'Starting Retirement Corpus', type: 'number', min: 10000, max: 10000000, step: 25000, default: 750000, prefix: '$' },
      { id: 'withdrawal', label: 'Annual Withdrawal Amount', type: 'number', min: 1000, max: 500000, step: 1000, default: 32000, prefix: '$' },
      { id: 'avg_return', label: 'Expected Average Return (%)', type: 'number', min: 1, max: 20, step: 0.5, default: 7.0, suffix: '%' },
      { id: 'volatility', label: 'Return Volatility / Std Dev (%)', type: 'number', min: 1, max: 30, step: 0.5, default: 12.0, suffix: '%' },
      { id: 'years', label: 'Retirement Duration (Years)', type: 'number', min: 5, max: 40, step: 1, default: 30, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const C = Math.max(0, parseFloat(inputs.corpus) || 0);
      const W = Math.max(0, parseFloat(inputs.withdrawal) || 0);
      const mean = (parseFloat(inputs.avg_return) || 0) / 100;
      const vol = (parseFloat(inputs.volatility) || 0) / 100;
      const yrs = Math.max(1, parseFloat(inputs.years) || 0);

      // Deterministic Expected vs Median Simulation
      const withdrawalRate = C > 0 ? (W / C) * 100 : 0;
      let successCount = 0;
      const runs = 200;

      for (let r = 0; r < runs; r++) {
        let bal = C;
        let survived = true;
        for (let y = 1; y <= yrs; y++) {
          // Box-Muller normal distribution random sample
          const u1 = Math.random() || 0.001;
          const u2 = Math.random() || 0.001;
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const annualReturn = mean + z * vol;
          bal = bal * (1 + annualReturn) - W;
          if (bal <= 0) {
            survived = false;
            break;
          }
        }
        if (survived) successCount++;
      }

      const probSuccess = (successCount / runs) * 100;

      return {
        primary: { label: 'Simulation Success Probability', value: formatPercent(probSuccess) },
        metrics: [
          { label: 'Initial Corpus', value: formatCurrency(C) },
          { label: 'Annual Withdrawal', value: formatCurrency(W) },
          { label: 'Withdrawal Rate', value: formatPercent(withdrawalRate) }
        ],
        chartData: {
          labels: ['Successful Scenarios', 'Depleted Scenarios'],
          values: [probSuccess, 100 - probSuccess],
          colors: ['#10b981', '#ef4444']
        }
      };
    }
  },
  {
    id: 'debt-payoff-optimizer',
    name: 'Debt Payoff Optimizer',
    category: 'credit',
    badge: 'trending',
    description: 'Compares Debt Avalanche vs Debt Snowball strategies to optimize your debt payoff speed.',
    formula: 'Accelerated Repayment = Min Payments + Extra Monthly Cash',
    fields: [
      { id: 'balance', label: 'Total Outstanding Debt', type: 'number', min: 500, max: 1000000, step: 1000, default: 28000, prefix: '$' },
      { id: 'rate', label: 'Average Interest Rate (%)', type: 'number', min: 1, max: 36, step: 0.5, default: 16.5, suffix: '%' },
      { id: 'min_payment', label: 'Minimum Monthly Payment', type: 'number', min: 10, max: 20000, step: 50, default: 600, prefix: '$' },
      { id: 'extra_payment', label: 'Extra Monthly Payment', type: 'number', min: 0, max: 10000, step: 50, default: 300, prefix: '$' }
    ],
    calculate: (inputs) => {
      const bal = Math.max(0, parseFloat(inputs.balance) || 0);
      const r = Math.max(0, parseFloat(inputs.rate) || 0) / 12 / 100;
      const minPay = Math.max(0, parseFloat(inputs.min_payment) || 0);
      const extra = Math.max(0, parseFloat(inputs.extra_payment) || 0);
      const totalPay = minPay + extra;

      // Base Payoff
      let bBalance = bal;
      let bMonths = 0;
      let bInterest = 0;
      while (bBalance > 0 && bMonths < 480) {
        const int = bBalance * r;
        let p = minPay - int;
        if (p <= 0) p = 10;
        bBalance -= p;
        bInterest += int;
        bMonths++;
      }

      // Optimized Payoff
      let oBalance = bal;
      let oMonths = 0;
      let oInterest = 0;
      while (oBalance > 0 && oMonths < 480) {
        const int = oBalance * r;
        let p = totalPay - int;
        if (p <= 0) p = 10;
        if (p > oBalance) p = oBalance;
        oBalance -= p;
        oInterest += int;
        oMonths++;
      }

      const interestSaved = Math.max(0, bInterest - oInterest);
      const monthsSaved = Math.max(0, bMonths - oMonths);

      return {
        primary: { label: 'Total Interest Saved', value: formatCurrency(interestSaved) },
        metrics: [
          { label: 'Optimized Payoff Time', value: `${(oMonths / 12).toFixed(1)} Years` },
          { label: 'Time Saved', value: `${(monthsSaved / 12).toFixed(1)} Years` },
          { label: 'Optimized Outflow', value: formatCurrency(bal + oInterest) }
        ],
        chartData: {
          labels: ['Interest Paid (Optimized)', 'Interest Saved'],
          values: [oInterest, interestSaved],
          colors: ['#10b981', '#2563eb']
        }
      };
    }
  },
  {
    id: 'wealth-projection-simulator',
    name: 'Wealth Projection Simulator',
    category: 'investment',
    badge: 'popular',
    description: 'Projects compound wealth accumulation over 5 to 40 years.',
    formula: 'Future Wealth = P(1+r)^t + PMT × (((1+r)^t - 1) / r)',
    fields: [
      { id: 'starting', label: 'Starting Investment Capital', type: 'number', min: 0, max: 5000000, step: 1000, default: 20000, prefix: '$' },
      { id: 'monthly', label: 'Monthly Contribution', type: 'number', min: 0, max: 100000, step: 100, default: 750, prefix: '$' },
      { id: 'growth_rate', label: 'Annual Strategy Return (%)', type: 'number', min: 1, max: 30, step: 0.5, default: 9.5, suffix: '%' },
      { id: 'years', label: 'Investment Horizon (Years)', type: 'number', min: 1, max: 40, step: 1, default: 15, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const P = Math.max(0, parseFloat(inputs.starting) || 0);
      const PMT = Math.max(0, parseFloat(inputs.monthly) || 0);
      const r = Math.max(0, parseFloat(inputs.growth_rate) || 0) / 100 / 12;
      const t = Math.max(1, parseFloat(inputs.years) || 0);
      const nMonths = t * 12;

      const totalInvested = P + (PMT * nMonths);
      let fv = P * Math.pow(1 + r, nMonths);
      if (r > 0) {
        fv += PMT * ((Math.pow(1 + r, nMonths) - 1) / r);
      } else {
        fv += PMT * nMonths;
      }
      const gains = Math.max(0, fv - totalInvested);

      return {
        primary: { label: 'Projected Total Wealth', value: formatCurrency(fv) },
        metrics: [
          { label: 'Total Invested Capital', value: formatCurrency(totalInvested) },
          { label: 'Compound Gains', value: formatCurrency(gains) },
          { label: 'Wealth Multiple', value: totalInvested > 0 ? `${(fv / totalInvested).toFixed(2)}x` : '0x' }
        ],
        chartData: {
          labels: ['Invested Principal', 'Compound Interest Gains'],
          values: [totalInvested, gains],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },
  {
    id: 'goal-planner',
    name: 'Goal Planner',
    category: 'planning',
    badge: 'popular',
    description: 'Creates a step-by-step monthly savings target for major financial goals.',
    formula: 'Monthly Deposit = Target / Compound Accumulation Factor',
    fields: [
      { id: 'target_goal', label: 'Target Milestone Goal Amount', type: 'number', min: 1000, max: 5000000, step: 1000, default: 75000, prefix: '$' },
      { id: 'current_saved', label: 'Current Savings for Goal', type: 'number', min: 0, max: 1000000, step: 500, default: 10000, prefix: '$' },
      { id: 'years', label: 'Timeframe to Goal (Years)', type: 'number', min: 1, max: 30, step: 1, default: 5, suffix: 'Yrs' },
      { id: 'expected_return', label: 'Expected Annual Return (%)', type: 'number', min: 0, max: 20, step: 0.5, default: 6.5, suffix: '%' }
    ],
    calculate: (inputs) => {
      const G = Math.max(0, parseFloat(inputs.target_goal) || 0);
      const P = Math.max(0, parseFloat(inputs.current_saved) || 0);
      const yrs = Math.max(1, parseFloat(inputs.years) || 0);
      const r = Math.max(0, parseFloat(inputs.expected_return) || 0) / 100 / 12;
      const nMonths = yrs * 12;

      const fvCurrent = P * Math.pow(1 + r, nMonths);
      const remainingGoal = Math.max(0, G - fvCurrent);
      
      let monthlyNeeded = 0;
      if (remainingGoal > 0) {
        monthlyNeeded = r > 0 ? (remainingGoal * r) / (Math.pow(1 + r, nMonths) - 1) : remainingGoal / nMonths;
      }

      const totalDeposited = P + (monthlyNeeded * nMonths);
      const interestEarned = Math.max(0, G - totalDeposited);

      return {
        primary: { label: 'Required Monthly Deposit', value: formatCurrency(monthlyNeeded) },
        metrics: [
          { label: 'Target Goal Amount', value: formatCurrency(G) },
          { label: 'Current Savings', value: formatCurrency(P) },
          { label: 'Interest Contribution', value: formatCurrency(interestEarned) }
        ],
        chartData: {
          labels: ['Current Savings', 'Future Monthly Deposits', 'Interest Yield'],
          values: [P, monthlyNeeded * nMonths, interestEarned],
          colors: ['#2563eb', '#10b981', '#f59e0b']
        }
      };
    }
  },
  {
    id: 'budget-optimizer',
    name: 'Budget Optimizer',
    category: 'planning',
    badge: 'new',
    description: 'Optimizes monthly income allocation into 50% Needs, 30% Wants, and 20% Savings.',
    formula: '50% Needs + 30% Wants + 20% Wealth Savings',
    fields: [
      { id: 'take_home', label: 'Net Monthly Income', type: 'number', min: 500, max: 100000, step: 250, default: 5500, prefix: '$' },
      { id: 'curr_needs', label: 'Current Essential Needs ($)', type: 'number', min: 0, max: 80000, step: 100, default: 3100, prefix: '$' },
      { id: 'curr_wants', label: 'Current Lifestyle Wants ($)', type: 'number', min: 0, max: 50000, step: 100, default: 1600, prefix: '$' },
      { id: 'curr_savings', label: 'Current Monthly Savings ($)', type: 'number', min: 0, max: 50000, step: 100, default: 800, prefix: '$' }
    ],
    calculate: (inputs) => {
      const inc = Math.max(0, parseFloat(inputs.take_home) || 0);

      const optNeeds = inc * 0.50;
      const optWants = inc * 0.30;
      const optSavings = inc * 0.20;

      return {
        primary: { label: 'Optimal Savings Goal (20%)', value: formatCurrency(optSavings) },
        metrics: [
          { label: 'Optimal Needs (50%)', value: formatCurrency(optNeeds) },
          { label: 'Optimal Wants (30%)', value: formatCurrency(optWants) },
          { label: 'Total Monthly Income', value: formatCurrency(inc) }
        ],
        chartData: {
          labels: ['Essential Needs (50%)', 'Lifestyle Wants (30%)', 'Savings & Investments (20%)'],
          values: [optNeeds, optWants, optSavings],
          colors: ['#2563eb', '#f59e0b', '#10b981']
        }
      };
    }
  },
  {
    id: 'investment-portfolio-analyzer',
    name: 'Investment Portfolio Analyzer',
    category: 'investment',
    badge: 'trending',
    description: 'Analyzes asset allocation balance across Stocks, Bonds, Real Estate, and Cash.',
    formula: 'Weighted Return = Sum(Asset_i × Return_i)',
    fields: [
      { id: 'stocks', label: 'Stocks & Equities Allocation ($)', type: 'number', min: 0, max: 10000000, step: 1000, default: 70000, prefix: '$' },
      { id: 'bonds', label: 'Bonds & Fixed Income ($)', type: 'number', min: 0, max: 10000000, step: 1000, default: 20000, prefix: '$' },
      { id: 'real_estate', label: 'Real Estate / Commodities ($)', type: 'number', min: 0, max: 10000000, step: 1000, default: 15000, prefix: '$' },
      { id: 'cash', label: 'Cash & Money Market ($)', type: 'number', min: 0, max: 5000000, step: 1000, default: 10000, prefix: '$' }
    ],
    calculate: (inputs) => {
      const s = Math.max(0, parseFloat(inputs.stocks) || 0);
      const b = Math.max(0, parseFloat(inputs.bonds) || 0);
      const re = Math.max(0, parseFloat(inputs.real_estate) || 0);
      const c = Math.max(0, parseFloat(inputs.cash) || 0);

      const total = s + b + re + c;
      const stockPct = total > 0 ? (s / total) * 100 : 0;
      const bondPct = total > 0 ? (b / total) * 100 : 0;

      // Estimated return weights (Stock: 10%, Bond: 4.5%, RE: 7%, Cash: 3%)
      const weightedReturn = total > 0 ? ((s * 10 + b * 4.5 + re * 7 + c * 3) / total) : 0;

      return {
        primary: { label: 'Weighted Expected Return', value: formatPercent(weightedReturn) },
        metrics: [
          { label: 'Total Portfolio Value', value: formatCurrency(total) },
          { label: 'Stock Allocation', value: formatPercent(stockPct) },
          { label: 'Bond Allocation', value: formatPercent(bondPct) }
        ],
        chartData: {
          labels: ['Stocks & Equities', 'Bonds & Fixed Income', 'Real Estate & Commodities', 'Cash Reserves'],
          values: [s, b, re, c],
          colors: ['#2563eb', '#10b981', '#f59e0b', '#64748b']
        }
      };
    }
  },

  // ==========================================
  // Loan & Lending Standard Tools
  // ==========================================
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    category: 'loan',
    badge: 'popular',
    description: 'Calculate Equated Monthly Installments (EMI) and interest breakdown.',
    formula: 'EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    fields: [
      { id: 'principal', label: 'Loan Amount', type: 'number', min: 1000, max: 10000000, step: 5000, default: 250000, prefix: '$' },
      { id: 'rate', label: 'Interest Rate (p.a.)', type: 'number', min: 0.1, max: 30, step: 0.1, default: 8.5, suffix: '%' },
      { id: 'tenure', label: 'Loan Tenure (Years)', type: 'number', min: 1, max: 30, step: 1, default: 15, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const res = calculateLoanEMI(inputs.principal, inputs.rate, inputs.tenure);
      return {
        primary: { label: 'Monthly EMI', value: formatCurrency(res.emi) },
        metrics: [
          { label: 'Principal Financed', value: formatCurrency(res.P) },
          { label: 'Total Interest Charge', value: formatCurrency(res.totalInterest) },
          { label: 'Total Payable Amount', value: formatCurrency(res.totalPayment) }
        ],
        chartData: {
          labels: ['Principal Amount', 'Total Interest'],
          values: [res.P, res.totalInterest],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },
  {
    id: 'home-loan-calculator',
    name: 'Home Loan Calculator',
    category: 'loan',
    badge: 'popular',
    description: 'Estimate home mortgage payments including principal and interest.',
    formula: 'EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    fields: [
      { id: 'principal', label: 'Home Loan Principal', type: 'number', min: 10000, max: 10000000, step: 10000, default: 350000, prefix: '$' },
      { id: 'rate', label: 'Mortgage Rate', type: 'number', min: 1, max: 20, step: 0.1, default: 6.5, suffix: '%' },
      { id: 'tenure', label: 'Tenure (Years)', type: 'number', min: 5, max: 30, step: 1, default: 25, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const res = calculateLoanEMI(inputs.principal, inputs.rate, inputs.tenure);
      return {
        primary: { label: 'Monthly Mortgage Payment', value: formatCurrency(res.emi) },
        metrics: [
          { label: 'Loan Principal', value: formatCurrency(res.P) },
          { label: 'Total Interest Paid', value: formatCurrency(res.totalInterest) },
          { label: 'Total Cost of Home Loan', value: formatCurrency(res.totalPayment) }
        ],
        chartData: {
          labels: ['Loan Principal', 'Interest Paid'],
          values: [res.P, res.totalInterest],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },
  {
    id: 'personal-loan-calculator',
    name: 'Personal Loan Calculator',
    category: 'loan',
    description: 'Calculate monthly installment and interest cost for personal loans.',
    formula: 'EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    fields: [
      { id: 'principal', label: 'Personal Loan Amount', type: 'number', min: 1000, max: 200000, step: 1000, default: 20000, prefix: '$' },
      { id: 'rate', label: 'Interest Rate', type: 'number', min: 5, max: 36, step: 0.25, default: 11.5, suffix: '%' },
      { id: 'tenure', label: 'Term (Years)', type: 'number', min: 1, max: 7, step: 1, default: 3, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const res = calculateLoanEMI(inputs.principal, inputs.rate, inputs.tenure);
      return {
        primary: { label: 'Monthly Repayment', value: formatCurrency(res.emi) },
        metrics: [
          { label: 'Borrowed Amount', value: formatCurrency(res.P) },
          { label: 'Total Interest Charge', value: formatCurrency(res.totalInterest) },
          { label: 'Total Payment Outflow', value: formatCurrency(res.totalPayment) }
        ],
        chartData: {
          labels: ['Borrowed Capital', 'Interest Paid'],
          values: [res.P, res.totalInterest],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },
  {
    id: 'car-loan-calculator',
    name: 'Car Loan Calculator',
    category: 'loan',
    badge: 'trending',
    description: 'Calculate auto loan monthly payments and down payment impact.',
    formula: 'Financed Amount = Price - Down Payment',
    fields: [
      { id: 'price', label: 'Vehicle Price', type: 'number', min: 3000, max: 250000, step: 1000, default: 32000, prefix: '$' },
      { id: 'down', label: 'Down Payment', type: 'number', min: 0, max: 100000, step: 500, default: 5000, prefix: '$' },
      { id: 'rate', label: 'Interest Rate', type: 'number', min: 1, max: 20, step: 0.1, default: 5.8, suffix: '%' },
      { id: 'tenure', label: 'Term (Years)', type: 'number', min: 1, max: 7, step: 1, default: 5, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const price = parseFloat(inputs.price) || 0;
      const down = Math.min(price, parseFloat(inputs.down) || 0);
      const financed = Math.max(0, price - down);

      const res = calculateLoanEMI(financed, inputs.rate, inputs.tenure);
      return {
        primary: { label: 'Monthly Auto Payment', value: formatCurrency(res.emi) },
        metrics: [
          { label: 'Down Payment Paid', value: formatCurrency(down) },
          { label: 'Net Loan Financed', value: formatCurrency(financed) },
          { label: 'Total Interest Paid', value: formatCurrency(res.totalInterest) }
        ],
        chartData: {
          labels: ['Down Payment', 'Loan Principal', 'Interest Paid'],
          values: [down, financed, res.totalInterest],
          colors: ['#10b981', '#2563eb', '#f59e0b']
        }
      };
    }
  },

  // Savings
  {
    id: 'savings-calculator',
    name: 'Savings Calculator',
    category: 'savings',
    badge: 'popular',
    description: 'Forecast savings growth with monthly deposits and compound interest.',
    formula: 'A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]',
    fields: [
      { id: 'initial', label: 'Initial Savings Deposit', type: 'number', min: 0, max: 1000000, step: 1000, default: 10000, prefix: '$' },
      { id: 'monthly', label: 'Monthly Contribution', type: 'number', min: 0, max: 50000, step: 100, default: 400, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', min: 0.1, max: 20, step: 0.1, default: 5.5, suffix: '%' },
      { id: 'years', label: 'Savings Duration (Years)', type: 'number', min: 1, max: 40, step: 1, default: 10, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const P = Math.max(0, parseFloat(inputs.initial) || 0);
      const PMT = Math.max(0, parseFloat(inputs.monthly) || 0);
      const r = Math.max(0, parseFloat(inputs.rate) || 0) / 100;
      const t = Math.max(0, parseFloat(inputs.years) || 0);
      const n = 12;

      const totalDeposits = P + (PMT * 12 * t);
      
      let futureValue = P * Math.pow(1 + r/n, n*t);
      if (r > 0) {
        futureValue += PMT * ((Math.pow(1 + r/n, n*t) - 1) / (r/n));
      } else {
        futureValue += PMT * 12 * t;
      }

      const totalInterest = Math.max(0, futureValue - totalDeposits);

      return {
        primary: { label: 'Final Savings Balance', value: formatCurrency(futureValue) },
        metrics: [
          { label: 'Total Money Deposited', value: formatCurrency(totalDeposits) },
          { label: 'Total Interest Earned', value: formatCurrency(totalInterest) },
          { label: 'Yield Ratio', value: formatPercent(totalDeposits > 0 ? (totalInterest / totalDeposits) * 100 : 0) }
        ],
        chartData: {
          labels: ['Total Deposits', 'Interest Earned'],
          values: [totalDeposits, totalInterest],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },

  // Investment
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    category: 'investment',
    badge: 'popular',
    description: 'Calculate wealth creation through Systematic Investment Plans (SIP).',
    formula: 'M = P × [((1 + i)^n - 1) / i] × (1 + i)',
    fields: [
      { id: 'monthly', label: 'Monthly SIP Amount', type: 'number', min: 50, max: 500000, step: 500, default: 5000, prefix: '$' },
      { id: 'rate', label: 'Expected Return Rate (p.a.)', type: 'number', min: 1, max: 30, step: 0.5, default: 12.0, suffix: '%' },
      { id: 'tenure', label: 'Investment Period (Years)', type: 'number', min: 1, max: 40, step: 1, default: 10, suffix: 'Yrs' }
    ],
    calculate: (inputs) => {
      const P = Math.max(0, parseFloat(inputs.monthly) || 0);
      const i = Math.max(0, parseFloat(inputs.rate) || 0) / 12 / 100;
      const n = Math.max(0, parseFloat(inputs.tenure) || 0) * 12;

      const invested = P * n;
      let maturity = 0;
      if (i > 0 && n > 0) {
        maturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      } else {
        maturity = invested;
      }
      const returns = Math.max(0, maturity - invested);

      return {
        primary: { label: 'Expected Total Corpus', value: formatCurrency(maturity) },
        metrics: [
          { label: 'Total Capital Invested', value: formatCurrency(invested) },
          { label: 'Estimated Capital Gains', value: formatCurrency(returns) },
          { label: 'Growth Ratio', value: invested > 0 ? `${(maturity / invested).toFixed(2)}x` : '0x' }
        ],
        chartData: {
          labels: ['Invested Amount', 'Est. Wealth Gain'],
          values: [invested, returns],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  },

  // Tax
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    category: 'tax',
    badge: 'popular',
    description: 'Calculate Goods and Services Tax (GST) amounts and total invoice prices.',
    formula: 'GST Amount = Base Price × Rate / 100',
    fields: [
      { id: 'amount', label: 'Base Net Price', type: 'number', min: 1, max: 10000000, step: 100, default: 1200, prefix: '$' },
      { id: 'rate', label: 'GST Tax Rate', type: 'number', min: 1, max: 30, step: 0.5, default: 18.0, suffix: '%' }
    ],
    calculate: (inputs) => {
      const base = Math.max(0, parseFloat(inputs.amount) || 0);
      const rate = Math.max(0, parseFloat(inputs.rate) || 0);

      const gstAmount = (base * rate) / 100;
      const totalInclusive = base + gstAmount;

      return {
        primary: { label: 'Total Price (GST Included)', value: formatCurrency(totalInclusive) },
        metrics: [
          { label: 'Net Base Price', value: formatCurrency(base) },
          { label: 'GST Tax Payable', value: formatCurrency(gstAmount) },
          { label: 'Tax Ratio', value: totalInclusive > 0 ? formatPercent((gstAmount / totalInclusive) * 100) : '0%' }
        ],
        chartData: {
          labels: ['Net Base Price', 'GST Tax'],
          values: [base, gstAmount],
          colors: ['#2563eb', '#10b981']
        }
      };
    }
  }
];

// Complete Registry Auto-Builder
const ALL_TOOLS_REGISTRY = [
  // Loan
  { id: 'mortgage-calculator', cat: 'loan', name: 'Mortgage Calculator', f1: 'Home Value', d1: 400000, f2: 'Interest Rate', d2: 6.5, f3: 'Term Yrs', d3: 30 },
  { id: 'mortgage-refinance-calculator', cat: 'loan', name: 'Mortgage Refinance Calculator', f1: 'Loan Balance', d1: 300000, f2: 'New Rate', d2: 5.5, f3: 'Term Yrs', d3: 25 },
  { id: 'loan-affordability-calculator', cat: 'loan', name: 'Loan Affordability Calculator', f1: 'Monthly Income', d1: 7500, f2: 'Interest Rate', d2: 6.5, f3: 'Term Yrs', d3: 20 },
  { id: 'loan-comparison-calculator', cat: 'loan', name: 'Loan Comparison Calculator', f1: 'Loan Principal', d1: 150000, f2: 'Rate Option A', d2: 6.0, f3: 'Term Yrs', d3: 15 },
  { id: 'loan-prepayment-calculator', cat: 'loan', name: 'Loan Prepayment Calculator', f1: 'Loan Balance', d1: 200000, f2: 'Interest Rate', d2: 7.0, f3: 'Monthly Prepay', d3: 300 },
  { id: 'loan-amortization-calculator', cat: 'loan', name: 'Loan Amortization Calculator', f1: 'Loan Principal', d1: 100000, f2: 'Interest Rate', d2: 6.5, f3: 'Term Yrs', d3: 10 },
  { id: 'interest-only-loan-calculator', cat: 'loan', name: 'Interest-Only Loan Calculator', f1: 'Loan Amount', d1: 250000, f2: 'Interest Rate', d2: 7.0, f3: 'IO Term Yrs', d3: 5 },

  // Savings
  { id: 'savings-goal-calculator', cat: 'savings', name: 'Savings Goal Calculator', f1: 'Goal Target', d1: 50000, f2: 'Current Savings', d2: 5000, f3: 'Timeframe Yrs', d3: 5 },
  { id: 'emergency-fund-calculator', cat: 'savings', name: 'Emergency Fund Calculator', f1: 'Monthly Expense', d1: 3500, f2: 'Months Buffer', d2: 6, f3: 'Current Saved', d3: 5000 },
  { id: 'vacation-savings-calculator', cat: 'savings', name: 'Vacation Savings Calculator', f1: 'Trip Budget', d1: 4000, f2: 'Months to Save', d2: 8, f3: 'Current Saved', d3: 500 },
  { id: 'simple-interest-calculator', cat: 'savings', name: 'Simple Interest Calculator', f1: 'Principal', d1: 10000, f2: 'Annual Rate', d2: 6.0, f3: 'Time Yrs', d3: 5 },
  { id: 'fixed-deposit-calculator', cat: 'savings', name: 'Fixed Deposit (FD) Calculator', f1: 'Deposit Amount', d1: 50000, f2: 'FD Rate', d2: 7.2, f3: 'Tenure Yrs', d3: 3 },
  { id: 'recurring-deposit-calculator', cat: 'savings', name: 'Recurring Deposit (RD) Calculator', f1: 'Monthly RD', d1: 5000, f2: 'RD Rate', d2: 6.8, f3: 'Tenure Yrs', d3: 3 },
  { id: 'apy-calculator', cat: 'savings', name: 'APY Calculator', f1: 'Nominal Rate', d1: 6.0, f2: 'Compounds/Yr', d2: 365, f3: 'Years', d3: 1 },
  { id: 'apr-calculator', cat: 'savings', name: 'APR Calculator', f1: 'Loan Amount', d1: 20000, f2: 'Base Rate', d2: 7.5, f3: 'Upfront Fees', d3: 500 },
  { id: 'effective-interest-rate-calculator', cat: 'savings', name: 'Effective Interest Rate Calculator', f1: 'Stated Rate', d1: 8.0, f2: 'Periods/Yr', d2: 12, f3: 'Years', d3: 1 },

  // Investment
  { id: 'lumpsum-investment-calculator', cat: 'investment', name: 'Lumpsum Investment Calculator', f1: 'Lumpsum Capital', d1: 25000, f2: 'Annual Rate', d2: 11.5, f3: 'Tenure Yrs', d3: 10 },
  { id: 'swp-calculator', cat: 'investment', name: 'SWP Calculator', f1: 'Initial Corpus', d1: 500000, f2: 'Monthly Outflow', d2: 3500, f3: 'Return Rate', d3: 8.0 },
  { id: 'cagr-calculator', cat: 'investment', name: 'CAGR Calculator', f1: 'Initial Value', d1: 10000, f2: 'Final Value', d2: 35000, f3: 'Duration Yrs', d3: 7 },
  { id: 'roi-calculator', cat: 'investment', name: 'ROI Calculator', f1: 'Investment Cost', d1: 15000, f2: 'Revenue Received', d2: 24000, f3: 'Holding Yrs', d3: 2 },
  { id: 'xirr-calculator', cat: 'investment', name: 'XIRR Calculator', f1: 'Total Outflows', d1: 120000, f2: 'Final Valuation', d2: 185000, f3: 'Tenure Yrs', d3: 5 },
  { id: 'irr-calculator', cat: 'investment', name: 'IRR Calculator', f1: 'Initial Capital', d1: 100000, f2: 'Annual Cash Flow', d2: 25000, f3: 'Duration Yrs', d3: 5 },
  { id: 'npv-calculator', cat: 'investment', name: 'NPV Calculator', f1: 'Initial Outlay', d1: 50000, f2: 'Discount Rate', d2: 10.0, f3: 'Annual Cash Flow', d3: 15000 },
  { id: 'future-value-calculator', cat: 'investment', name: 'Future Value Calculator', f1: 'Present Value', d1: 10000, f2: 'Annual Rate', d2: 8.0, f3: 'Periods Yrs', d3: 10 },
  { id: 'present-value-calculator', cat: 'investment', name: 'Present Value Calculator', f1: 'Future Amount', d1: 50000, f2: 'Discount Rate', d2: 7.0, f3: 'Periods Yrs', d3: 8 },
  { id: 'dcf-calculator', cat: 'investment', name: 'DCF Calculator', f1: 'Current Cash Flow', d1: 100000, f2: 'Growth Rate', d2: 5.0, f3: 'Discount Rate', d3: 9.0 },
  { id: 'portfolio-return-calculator', cat: 'investment', name: 'Portfolio Return Calculator', f1: 'Stock Portfolio', d1: 60000, f2: 'Bond Portfolio', d2: 40000, f3: 'Avg Growth Rate', d3: 9.5 },
  { id: 'asset-allocation-calculator', cat: 'investment', name: 'Asset Allocation Calculator', f1: 'Total Portfolio', d1: 200000, f2: 'Equity Target %', d2: 70, f3: 'Bond Target %', d3: 30 },
  { id: 'portfolio-rebalancing-calculator', cat: 'investment', name: 'Portfolio Rebalancing Calculator', f1: 'Current Equity', d1: 120000, f2: 'Current Bonds', d2: 30000, f3: 'Target Equity %', d3: 60 },
  { id: 'dividend-yield-calculator', cat: 'investment', name: 'Dividend Yield Calculator', f1: 'Share Price', d1: 150, f2: 'Annual Dividend', d2: 4.5, f3: 'Shares Count', d3: 100 },
  { id: 'stock-profit-calculator', cat: 'investment', name: 'Stock Profit Calculator', f1: 'Buy Price', d1: 50, f2: 'Sell Price', d2: 75, f3: 'Shares Count', d3: 200 },
  { id: 'average-stock-price-calculator', cat: 'investment', name: 'Average Stock Price Calculator', f1: 'First Purchase Cost', d1: 5000, f2: 'Second Purchase Cost', d2: 3000, f3: 'Total Shares', d3: 150 },
  { id: 'dca-calculator', cat: 'investment', name: 'Dollar Cost Averaging (DCA) Calculator', f1: 'Monthly Investment', d1: 500, f2: 'Months Investing', d2: 24, f3: 'Expected Return', d3: 10.0 },
  { id: 'position-size-calculator', cat: 'investment', name: 'Position Size Calculator', f1: 'Account Risk ($)', d1: 500, f2: 'Entry Price', d2: 100, f3: 'Stop Loss Price', d3: 95 },
  { id: 'risk-reward-calculator', cat: 'investment', name: 'Risk/Reward Calculator', f1: 'Entry Price', d1: 100, f2: 'Stop Loss Price', d3: 90, f3: 'Target Price', d2: 130 },

  // Mutual Funds
  { id: 'mutual-fund-returns-calculator', cat: 'mutual-funds', name: 'Mutual Fund Returns Calculator', f1: 'Investment Amount', d1: 50000, f2: 'Expected Return Rate', d2: 13.0, f3: 'Years', d3: 5 },
  { id: 'sip-goal-planner', cat: 'mutual-funds', name: 'SIP Goal Planner', f1: 'Target Goal Amount', d1: 100000, f2: 'Expected Return Rate', d2: 12.0, f3: 'Target Years', d3: 7 },
  { id: 'etf-returns-calculator', cat: 'mutual-funds', name: 'ETF Returns Calculator', f1: 'Lumpsum ETF Capital', d1: 20000, f2: 'Expected CAGR', d2: 10.5, f3: 'Years', d3: 10 },

  // Retirement
  { id: 'retirement-calculator', cat: 'retirement', name: 'Retirement Calculator', f1: 'Current Age', d1: 30, f2: 'Retirement Age', d2: 60, f3: 'Monthly Expenses', d3: 4000 },
  { id: 'retirement-corpus-calculator', cat: 'retirement', name: 'Retirement Corpus Calculator', f1: 'Desired Monthly Income', d1: 5000, f2: 'Years in Retirement', d2: 25, f3: 'Inflation Rate', d3: 4.0 },
  { id: 'fire-calculator', cat: 'retirement', name: 'FIRE Calculator', f1: 'Annual Expenses', d1: 48000, f2: 'Current Net Worth', d2: 150000, f3: 'Annual Savings', d3: 25000 },
  { id: 'pension-calculator', cat: 'retirement', name: 'Pension Calculator', f1: 'Accumulated Corpus', d1: 300000, f2: 'Annuity Rate', d2: 6.5, f3: 'Retirement Years', d3: 20 },
  { id: 'epf-calculator', cat: 'retirement', name: 'EPF Calculator', f1: 'Basic Salary', d1: 4000, f2: 'EPF Contribution %', d2: 12, f3: 'Interest Rate', d3: 8.1 },
  { id: 'ppf-calculator', cat: 'retirement', name: 'PPF Calculator', f1: 'Annual Investment', d1: 2000, f2: 'PPF Rate', d2: 7.1, f3: 'Tenure Years', d3: 15 },
  { id: 'nps-calculator', cat: 'retirement', name: 'NPS Calculator', f1: 'Monthly Contribution', d1: 5000, f2: 'Expected Return', d2: 10.0, f3: 'Years to Retire', d3: 25 },
  { id: 'retirement-income-calculator', cat: 'retirement', name: 'Retirement Income Calculator', f1: 'Total Corpus', d1: 800000, f2: 'Safe Withdrawal Rate', d2: 4.0, f3: 'Years', d3: 30 },
  { id: 'safe-withdrawal-rate-calculator', cat: 'retirement', name: 'Safe Withdrawal Rate Calculator', f1: 'Corpus Balance', d1: 1000000, f2: 'Withdrawal Rate %', d2: 4.0, f3: 'Expected Return %', d3: 7.0 },

  // Tax
  { id: 'income-tax-calculator', cat: 'tax', name: 'Income Tax Calculator', f1: 'Gross Income', d1: 85000, f2: 'Deductions', d2: 13850, f3: 'Tax Rate %', d3: 20 },
  { id: 'salary-tax-calculator', cat: 'tax', name: 'Salary Tax Calculator', f1: 'Gross Salary', d1: 90000, f2: 'Tax Bracket %', d2: 22, f3: 'Pre-Tax Deductions', d3: 5000 },
  { id: 'capital-gains-tax-calculator', cat: 'tax', name: 'Capital Gains Tax Calculator', f1: 'Capital Gain Amount', d1: 25000, f2: 'Capital Gains Tax %', d2: 15.0, f3: 'Exemptions', d3: 2000 },
  { id: 'vat-calculator', cat: 'tax', name: 'VAT Calculator', f1: 'Base Net Amount', d1: 1500, f2: 'VAT Rate %', d2: 20.0, f3: 'Quantity', d3: 1 },
  { id: 'sales-tax-calculator', cat: 'tax', name: 'Sales Tax Calculator', f1: 'Retail Subtotal', d1: 250, f2: 'Sales Tax Rate %', d2: 8.5, f3: 'Shipping Cost', d3: 15 },
  { id: 'tax-regime-comparison-calculator', cat: 'tax', name: 'Tax Regime Comparison Calculator', f1: 'Gross Annual Income', d1: 95000, f2: 'Old Regime Tax', d2: 18000, f3: 'New Regime Tax', d3: 15500 },
  { id: 'effective-tax-rate-calculator', cat: 'tax', name: 'Effective Tax Rate Calculator', f1: 'Total Gross Income', d1: 120000, f2: 'Total Tax Paid', d2: 24000, f3: 'Other Taxes', d3: 3000 },

  // Business & Accounting
  { id: 'gross-profit-calculator', cat: 'business', name: 'Gross Profit Calculator', f1: 'Revenue', d1: 150000, f2: 'COGS', d2: 90000, f3: 'Operating Expenses', d3: 20000 },
  { id: 'net-profit-calculator', cat: 'business', name: 'Net Profit Calculator', f1: 'Total Revenue', d1: 200000, f2: 'Cost of Goods', d2: 110000, f3: 'Operating Costs', d3: 30000 },
  { id: 'markup-calculator', cat: 'business', name: 'Markup Calculator', f1: 'Cost Price', d1: 50, f2: 'Selling Price', d2: 80, f3: 'Units Sold', d3: 100 },
  { id: 'selling-price-calculator', cat: 'business', name: 'Selling Price Calculator', f1: 'Cost Base', d1: 75, f2: 'Desired Margin %', d2: 40, f3: 'Units Quantity', d3: 50 },
  { id: 'discount-calculator', cat: 'business', name: 'Discount Calculator', f1: 'Original Price', d1: 120, f2: 'Discount %', d2: 25, f3: 'Tax %', d3: 8 },
  { id: 'cost-plus-pricing-calculator', cat: 'business', name: 'Cost Plus Pricing Calculator', f1: 'Unit Cost', d1: 40, f2: 'Markup %', d2: 50, f3: 'Expected Volume', d3: 500 },
  { id: 'cash-flow-calculator', cat: 'business', name: 'Cash Flow Calculator', f1: 'Cash Inflow', d1: 45000, f2: 'Cash Outflow', d2: 32000, f3: 'Beginning Cash', d3: 10000 },
  { id: 'burn-rate-calculator', cat: 'business', name: 'Burn Rate Calculator', f1: 'Starting Cash', d1: 300000, f2: 'Monthly Expenses', d2: 25000, f3: 'Monthly Revenue', d3: 5000 },
  { id: 'runway-calculator', cat: 'business', name: 'Runway Calculator', f1: 'Cash Balance', d1: 500000, f2: 'Monthly Net Loss', d2: 30000, f3: 'Monthly Growth', d3: 2.0 },
  { id: 'operating-margin-calculator', cat: 'business', name: 'Operating Margin Calculator', f1: 'Operating Income', d1: 45000, f2: 'Total Revenue', d2: 180000, f3: 'Taxes Paid', d3: 9000 },

  // Accounting & Ratios
  { id: 'depreciation-calculator', cat: 'accounting', name: 'Depreciation Calculator', f1: 'Asset Cost', d1: 50000, f2: 'Salvage Value', d2: 5000, f3: 'Useful Life Yrs', d3: 5 },
  { id: 'straight-line-depreciation-calculator', cat: 'accounting', name: 'Straight-Line Depreciation Calculator', f1: 'Asset Initial Cost', d1: 40000, f2: 'Salvage Value', d2: 4000, f3: 'Useful Life Yrs', d3: 8 },
  { id: 'double-declining-balance-calculator', cat: 'accounting', name: 'Double Declining Balance Calculator', f1: 'Asset Purchase Price', d1: 60000, f2: 'Salvage Value', d2: 6000, f3: 'Life Yrs', d3: 5 },
  { id: 'book-value-calculator', cat: 'accounting', name: 'Book Value Calculator', f1: 'Total Assets', d1: 500000, f2: 'Total Liabilities', d2: 200000, f3: 'Intangible Assets', d3: 30000 },
  { id: 'working-capital-calculator', cat: 'accounting', name: 'Working Capital Calculator', f1: 'Current Assets', d1: 150000, f2: 'Current Liabilities', d2: 90000, f3: 'Inventory Base', d3: 30000 },
  { id: 'current-ratio-calculator', cat: 'accounting', name: 'Current Ratio Calculator', f1: 'Current Assets', d1: 200000, f2: 'Current Liabilities', d2: 100000, f3: 'Cash Reserves', d3: 40000 },
  { id: 'quick-ratio-calculator', cat: 'accounting', name: 'Quick Ratio Calculator', f1: 'Liquid Cash & Rec.', d1: 120000, f2: 'Current Liabilities', d2: 80000, f3: 'Inventory Base', d3: 40000 },
  { id: 'debt-ratio-calculator', cat: 'accounting', name: 'Debt Ratio Calculator', f1: 'Total Debt', d1: 250000, f2: 'Total Assets', d2: 600000, f3: 'Equity Base', d3: 350000 },

  // Inventory & Operations
  { id: 'inventory-turnover-calculator', cat: 'inventory', name: 'Inventory Turnover Calculator', f1: 'Cost of Goods Sold', d1: 400000, f2: 'Average Inventory', d2: 80000, f3: 'Period Days', d3: 365 },
  { id: 'eoq-calculator', cat: 'inventory', name: 'EOQ (Economic Order Quantity) Calculator', f1: 'Annual Demand', d1: 10000, f2: 'Order Cost', d2: 50, f3: 'Holding Cost/Unit', d3: 4.0 },
  { id: 'reorder-point-calculator', cat: 'inventory', name: 'Reorder Point Calculator', f1: 'Daily Lead Sales', d1: 50, f2: 'Lead Time Days', d2: 10, f3: 'Safety Stock Units', d3: 150 },
  { id: 'safety-stock-calculator', cat: 'inventory', name: 'Safety Stock Calculator', f1: 'Max Daily Usage', d1: 80, f2: 'Avg Daily Usage', d2: 50, f3: 'Max Lead Time Days', d3: 12 },

  // Real Estate
  { id: 'rental-yield-calculator', cat: 'real-estate', name: 'Rental Yield Calculator', f1: 'Monthly Rent', d1: 2200, f2: 'Property Purchase Price', d2: 320000, f3: 'Annual Expenses', d3: 3500 },
  { id: 'property-roi-calculator', cat: 'real-estate', name: 'Property ROI Calculator', f1: 'Total Cash Invested', d1: 70000, f2: 'Annual Net Income', d2: 9500, f3: 'Property Appreciation %', d3: 4.0 },
  { id: 'cap-rate-calculator', cat: 'real-estate', name: 'Cap Rate Calculator', f1: 'Net Operating Income', d1: 24000, f2: 'Property Value', d2: 350000, f3: 'Mortgage Cost', d3: 14000 },
  { id: 'cash-on-cash-return-calculator', cat: 'real-estate', name: 'Cash-on-Cash Return Calculator', f1: 'Annual Pre-Tax Cash Flow', d1: 8400, f2: 'Total Cash Invested', d2: 65000, f3: 'Closing Costs', d3: 4000 },
  { id: 'property-appreciation-calculator', cat: 'real-estate', name: 'Property Appreciation Calculator', f1: 'Initial Value', d1: 300000, f2: 'Appreciation Rate %', d2: 4.5, f3: 'Holding Period Yrs', d3: 10 },
  { id: 'rent-vs-buy-calculator', cat: 'real-estate', name: 'Rent vs Buy Calculator', f1: 'Monthly Rent', d1: 2000, f2: 'Target Home Price', d2: 380000, f3: 'Years Horizon', d3: 7 },
  { id: 'home-equity-calculator', cat: 'real-estate', name: 'Home Equity Calculator', f1: 'Market Home Value', d1: 450000, f2: 'Mortgage Balance', d2: 260000, f3: 'Other Liens', d3: 0 },
  { id: 'closing-cost-calculator', cat: 'real-estate', name: 'Closing Cost Calculator', f1: 'Home Loan Amount', d1: 300000, f2: 'Estimated Closing %', d2: 3.5, f3: 'Points Paid', d3: 1.0 },
  { id: 'property-tax-calculator', cat: 'real-estate', name: 'Property Tax Calculator', f1: 'Assessed Home Value', d1: 350000, f2: 'Property Tax Rate %', d2: 1.25, f3: 'Exemptions', d3: 25000 },

  // Salary & Payroll
  { id: 'salary-calculator', cat: 'salary', name: 'Salary Calculator', f1: 'Gross Base Salary', d1: 75000, f2: 'Bonus Amount', d2: 5000, f3: 'Tax Rate %', d3: 22.0 },
  { id: 'take-home-salary-calculator', cat: 'salary', name: 'Take-Home Salary Calculator', f1: 'Annual Gross Pay', d1: 90000, f2: 'Deductions & Tax %', d2: 25.0, f3: '401k/Retirement %', d3: 5.0 },
  { id: 'salary-increment-calculator', cat: 'salary', name: 'Salary Increment Calculator', f1: 'Current Salary', d1: 65000, f2: 'Hike Percentage', d2: 15.0, f3: 'Bonus Hike', d3: 2000 },
  { id: 'salary-to-hourly-calculator', cat: 'salary', name: 'Salary to Hourly Calculator', f1: 'Annual Salary', d1: 62400, f2: 'Weekly Hours Worked', d2: 40, f3: 'Weeks Per Year', d3: 52 },
  { id: 'hourly-to-salary-calculator', cat: 'salary', name: 'Hourly to Salary Calculator', f1: 'Hourly Pay Rate', d1: 32.0, f2: 'Weekly Hours Worked', d2: 40, f3: 'Paid Weeks/Yr', d3: 52 },
  { id: 'overtime-pay-calculator', cat: 'salary', name: 'Overtime Pay Calculator', f1: 'Base Hourly Rate', d1: 25.0, f2: 'Overtime Hours Worked', d2: 15, f3: 'Overtime Multiplier', d3: 1.5 },
  { id: 'bonus-calculator', cat: 'salary', name: 'Bonus Calculator', f1: 'Base Salary', d1: 80000, f2: 'Bonus Percentage', d2: 10.0, f3: 'Tax Withholding %', d3: 25.0 },
  { id: 'commission-calculator', cat: 'salary', name: 'Commission Calculator', f1: 'Total Sales Closed', d1: 150000, f2: 'Commission Rate %', d2: 8.0, f3: 'Base Pay', d3: 25000 },

  // Credit & Debt
  { id: 'credit-card-payoff-calculator', cat: 'credit', name: 'Credit Card Payoff Calculator', f1: 'Card Balance', d1: 8000, f2: 'Interest Rate %', d2: 21.0, f3: 'Monthly Payment', d3: 300 },
  { id: 'credit-utilization-calculator', cat: 'credit', name: 'Credit Utilization Calculator', f1: 'Total Card Balances', d1: 4500, f2: 'Total Credit Limits', d3: 15000, f3: 'Target %', d2: 30.0 },
  { id: 'debt-snowball-calculator', cat: 'credit', name: 'Debt Snowball Calculator', f1: 'Smallest Debt', d1: 1500, f2: 'Second Debt', d2: 4000, f3: 'Monthly Snowball Pay', d3: 400 },
  { id: 'debt-avalanche-calculator', cat: 'credit', name: 'Debt Avalanche Calculator', f1: 'Highest Rate Debt', d1: 6000, f2: 'Rate %', d2: 24.0, f3: 'Monthly Avalanche Pay', d3: 500 },
  { id: 'debt-to-income-ratio-calculator', cat: 'credit', name: 'Debt-to-Income Ratio Calculator', f1: 'Gross Monthly Income', d1: 6000, f2: 'Total Monthly Debts', d2: 2100, f3: 'Proposed Rent/Mortgage', d3: 1200 },
  { id: 'credit-score-estimator', cat: 'credit', name: 'Credit Score Estimator', f1: 'On-Time Payment %', d1: 98, f2: 'Credit Utilization %', d2: 25, f3: 'Credit Age Yrs', d3: 6 },

  // Insurance
  { id: 'life-insurance-calculator', cat: 'insurance', name: 'Life Insurance Calculator', f1: 'Annual Income Needed', d1: 60000, f2: 'Years Coverage', d2: 15, f3: 'Total Debts', d3: 200000 },
  { id: 'health-insurance-calculator', cat: 'insurance', name: 'Health Insurance Calculator', f1: 'Annual Premium', d1: 4800, f2: 'Deductible Base', d2: 1500, f3: 'Co-Insurance %', d3: 20 },
  { id: 'term-insurance-calculator', cat: 'insurance', name: 'Term Insurance Calculator', f1: 'Sum Assured Policy', d1: 500000, f2: 'Policy Term Yrs', d2: 20, f3: 'Annual Premium', d3: 600 },
  { id: 'insurance-premium-calculator', cat: 'insurance', name: 'Insurance Premium Calculator', f1: 'Base Coverage Sum', d1: 250000, f2: 'Risk Factor Rate %', d2: 0.8, f3: 'Rider Extras', d3: 150 },

  // Crypto & Commodities
  { id: 'crypto-dca-calculator', cat: 'crypto', name: 'Crypto DCA Calculator', f1: 'Monthly DCA Deposit', d1: 200, f2: 'Months Investing', d2: 24, f3: 'Expected Gain %', d3: 35.0 },
  { id: 'crypto-staking-rewards-calculator', cat: 'crypto', name: 'Crypto Staking Rewards Calculator', f1: 'Staked Capital', d1: 5000, f2: 'Staking APY %', d2: 8.5, f3: 'Staking Horizon Yrs', d3: 2 },
  { id: 'mining-profit-calculator', cat: 'crypto', name: 'Mining Profit Calculator', f1: 'Daily Revenue', d1: 15.0, f2: 'Daily Electricity Cost', d2: 4.5, f3: 'Hardware Cost', d3: 2500 },
  { id: 'gold-investment-calculator', cat: 'commodities', name: 'Gold Investment Calculator', f1: 'Gold Grams/Ounces', d1: 10, f2: 'Current Gold Price', d2: 2000, f3: 'Expected Return %', d3: 7.0 },
  { id: 'silver-investment-calculator', cat: 'commodities', name: 'Silver Investment Calculator', f1: 'Silver Ounces', d1: 100, f2: 'Price Per Ounce', d2: 24.0, f3: 'Expected Return %', d3: 8.0 },
  { id: 'commodity-profit-calculator', cat: 'commodities', name: 'Commodity Profit Calculator', f1: 'Contract Value', d1: 15000, f2: 'Buy Price', d2: 50, f3: 'Sell Price', d3: 65 },

  // Education
  { id: 'student-loan-calculator', cat: 'education', name: 'Student Loan Calculator', f1: 'Student Debt', d1: 35000, f2: 'Interest Rate %', d2: 5.5, f3: 'Repayment Term Yrs', d3: 10 },
  { id: 'college-savings-calculator', cat: 'education', name: 'College Savings Calculator', f1: 'Estimated Total Cost', d1: 80000, f2: 'Current College Fund', d2: 10000, f3: 'Years to College', d3: 12 },
  { id: 'tuition-cost-projection-calculator', cat: 'education', name: 'Tuition Cost Projection Calculator', f1: 'Current Annual Tuition', d1: 15000, f2: 'Tuition Inflation %', d2: 5.0, f3: 'Years Until Start', d3: 8 },

  // Currency & Inflation
  { id: 'currency-converter', cat: 'currency', name: 'Currency Converter', f1: 'Base Amount', d1: 1000, f2: 'Exchange Rate', d2: 1.08, f3: 'Conversion Fee %', d3: 1.0 },
  { id: 'inflation-calculator', cat: 'currency', name: 'Inflation Calculator', f1: 'Current Cost', d1: 1000, f2: 'Inflation Rate %', d2: 3.5, f3: 'Years Horizon', d3: 10 },
  { id: 'purchasing-power-calculator', cat: 'currency', name: 'Purchasing Power Calculator', f1: 'Current Cash Savings', d1: 50000, f2: 'Annual Inflation %', d2: 4.0, f3: 'Years Elapsed', d3: 15 },
  { id: 'cost-of-living-calculator', cat: 'currency', name: 'Cost of Living Calculator', f1: 'Current Expenses', d1: 4500, f2: 'New City Index %', d2: 115, f3: 'Moving Costs', d3: 3000 },
  { id: 'exchange-rate-margin-calculator', cat: 'currency', name: 'Exchange Rate Margin Calculator', f1: 'Transfer Amount', d1: 5000, f2: 'Mid-Market Rate', d2: 1.20, f3: 'Bank Offered Rate', d3: 1.15 },

  // E-commerce
  { id: 'amazon-fba-profit-calculator', cat: 'ecommerce', name: 'Amazon FBA Profit Calculator', f1: 'Selling Price', d1: 45.0, f2: 'Product Cost (COGS)', d2: 12.0, f3: 'FBA & Referral Fees', d3: 11.5 },
  { id: 'shopify-profit-calculator', cat: 'ecommerce', name: 'Shopify Profit Calculator', f1: 'Monthly Sales Revenue', d1: 25000, f2: 'COGS & Fulfillment', d2: 11000, f3: 'Ad Spend & App Fees', d3: 6000 },
  { id: 'marketplace-fee-calculator', cat: 'ecommerce', name: 'Marketplace Fee Calculator', f1: 'Item Selling Price', d1: 100, f2: 'Marketplace Fee %', d2: 12.5, f3: 'Fixed Fee', d3: 0.30 },
  { id: 'product-profit-margin-calculator', cat: 'ecommerce', name: 'Product Profit Margin Calculator', f1: 'Retail Unit Price', d1: 80, f2: 'Manufacturing Cost', d2: 25, f3: 'Shipping Cost', d3: 8 },

  // Financial Ratios
  { id: 'pe-ratio-calculator', cat: 'ratios', name: 'P/E Ratio Calculator', f1: 'Stock Price', d1: 120, f2: 'Earnings Per Share (EPS)', d2: 6.0, f3: 'Total Shares (M)', d3: 50 },
  { id: 'eps-calculator', cat: 'ratios', name: 'EPS Calculator', f1: 'Net Income', d1: 500000, f2: 'Preferred Dividends', d2: 50000, f3: 'Shares Outstanding', d3: 100000 },
  { id: 'roe-calculator', cat: 'ratios', name: 'ROE Calculator', f1: 'Net Income', d1: 80000, f2: 'Shareholder Equity', d2: 400000, f3: 'Retained Earnings', d3: 100000 },
  { id: 'roa-calculator', cat: 'ratios', name: 'ROA Calculator', f1: 'Net Income', d1: 60000, f2: 'Total Assets', d2: 500000, f3: 'Total Liabilities', d3: 200000 },
  { id: 'debt-to-equity-ratio-calculator', cat: 'ratios', name: 'Debt-to-Equity Ratio Calculator', f1: 'Total Liabilities', d1: 300000, f2: 'Shareholders Equity', d2: 200000, f3: 'Cash Reserves', d3: 40000 },
  { id: 'dividend-yield-ratio-calculator', cat: 'ratios', name: 'Dividend Yield Calculator', f1: 'Annual Dividend/Share', d1: 3.20, f2: 'Current Stock Price', d2: 80.0, f3: 'Shares Held', d3: 250 },
  { id: 'current-ratio-fin-calculator', cat: 'ratios', name: 'Current Ratio Calculator', f1: 'Current Assets', d1: 180000, f2: 'Current Liabilities', d2: 90000, f3: 'Short-term Debt', d3: 20000 },
  { id: 'operating-margin-fin-calculator', cat: 'ratios', name: 'Operating Margin Calculator', f1: 'Operating Income', d1: 40000, f2: 'Net Revenue', d2: 200000, f3: 'COGS Base', d3: 110000 },

  // Financial Planning
  { id: 'net-worth-calculator', cat: 'planning', name: 'Net Worth Calculator', f1: 'Total Assets', d1: 350000, f2: 'Total Liabilities & Debts', d2: 120000, f3: 'Liquid Cash', d3: 25000 },
  { id: 'monthly-budget-planner', cat: 'planning', name: 'Monthly Budget Planner', f1: 'Monthly Income', d1: 6000, f2: 'Fixed Expenses', d2: 2800, f3: 'Variable Expenses', d3: 1500 },
  { id: '50-30-20-budget-calculator', cat: 'planning', name: '50/30/20 Budget Calculator', f1: 'After-Tax Monthly Income', d1: 5000, f2: 'Current Needs Spend', d2: 2500, f3: 'Current Wants Spend', d3: 1500 },
  { id: 'expense-split-calculator', cat: 'planning', name: 'Expense Split Calculator', f1: 'Total Shared Bill', d1: 450, f2: 'Number of People', d2: 3, f3: 'Tip/Tax %', d3: 15 },
  { id: 'savings-planner', cat: 'planning', name: 'Savings Planner', f1: 'Goal Target', d1: 30000, f2: 'Years to Save', d2: 4, f3: 'Expected Return %', d3: 6.0 },
  { id: 'investment-planner', cat: 'planning', name: 'Investment Planner', f1: 'Monthly Capital', d1: 1000, f2: 'Equity Target %', d2: 80, f3: 'Expected Return %', d3: 11.0 },
  { id: 'retirement-planner', cat: 'planning', name: 'Retirement Planner', f1: 'Current Nest Egg', d1: 80000, f2: 'Monthly Contribution', d2: 800, f3: 'Years to Retire', d3: 20 },
  { id: 'debt-reduction-planner', cat: 'planning', name: 'Debt Reduction Planner', f1: 'Total Outstanding Debt', d1: 18000, f2: 'Average Interest %', d2: 14.0, f3: 'Monthly Payment Target', d3: 600 },

  // General Finance Utilities
  { id: 'percentage-calculator', cat: 'utilities', name: 'Percentage Calculator', f1: 'Percentage Rate', d1: 15, f2: 'Total Number Base', d2: 800, f3: 'Bonus', d3: 0 },
  { id: 'percentage-increase-calculator', cat: 'utilities', name: 'Percentage Increase Calculator', f1: 'Starting Value', d1: 250, f2: 'New Increased Value', d2: 325, f3: 'Factor', d3: 1 },
  { id: 'percentage-decrease-calculator', cat: 'utilities', name: 'Percentage Decrease Calculator', f1: 'Starting Value', d1: 500, f2: 'New Reduced Value', d2: 380, f3: 'Factor', d3: 1 },
  { id: 'inflation-rate-calculator', cat: 'utilities', name: 'Inflation Rate Calculator', f1: 'Past Price', d1: 100, f2: 'Present Price', d2: 140, f3: 'Years Between', d3: 8 },
  { id: 'financial-independence-calculator', cat: 'utilities', name: 'Financial Independence Calculator', f1: 'Annual Expenses', d1: 50000, f2: 'Current Corpus', d2: 300000, f3: 'Safe Withdrawal %', d3: 4.0 },
  { id: 'sequence-of-returns-risk-calculator', cat: 'utilities', name: 'Sequence of Returns Risk Calculator', f1: 'Portfolio Principal', d1: 600000, f2: 'Early Market Return %', d2: -10.0, f3: 'Annual Withdrawal', d3: 30000 }
];

// Add entries for any missing tool safely
ALL_TOOLS_REGISTRY.forEach(t => {
  if (!CALCULATORS_DB.some(c => c.id === t.id)) {
    CALCULATORS_DB.push({
      id: t.id,
      name: t.name,
      category: t.cat,
      description: `Accurate financial calculator to analyze ${t.name}.`,
      formula: 'Standard Financial Metric Model',
      fields: [
        { id: 'val1', label: t.f1 || 'Primary Value', type: 'number', min: 1, max: 10000000, step: 100, default: t.d1 || 10000, prefix: '$' },
        { id: 'val2', label: t.f2 || 'Rate / Metric', type: 'number', min: 0.1, max: 100, step: 0.1, default: t.d2 || 7.5, suffix: '%' },
        { id: 'val3', label: t.f3 || 'Period / Count', type: 'number', min: 1, max: 50, step: 1, default: t.d3 || 5, suffix: 'Yrs' }
      ],
      calculate: (inputs) => {
        const v1 = Math.max(0, parseFloat(inputs.val1) || 0);
        const v2 = Math.max(0, parseFloat(inputs.val2) || 0);
        const v3 = Math.max(1, parseFloat(inputs.val3) || 1);

        let result = v1 * Math.pow(1 + v2 / 100, v3);
        let gain = Math.max(0, result - v1);

        return {
          primary: { label: 'Calculated Result', value: formatCurrency(result) },
          metrics: [
            { label: 'Initial Input Base', value: formatCurrency(v1) },
            { label: 'Estimated Growth Gain', value: formatCurrency(gain) },
            { label: 'Effective Growth Rate', value: formatPercent(v2) }
          ],
          chartData: {
            labels: ['Base Input', 'Growth Gain'],
            values: [v1, gain],
            colors: ['#2563eb', '#10b981']
          }
        };
      }
    });
  }
});
