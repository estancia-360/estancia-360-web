export interface DashboardHerd {
  totalActive: number;
  criaCount: number;
  recriaCount: number;
  engordeCount: number;
}

export interface DashboardAlerts {
  quarantineCount: number;
  activeWithdrawalCount: number;
  pendingSalesCount: number;
}

export interface DashboardMovements {
  salesCountThisMonth: number;
  salesAmountThisMonth: number;
  purchasesCountThisMonth: number;
  purchasesAmountThisMonth: number;
}

export interface DashboardMonthlyBirth {
  month: string;
  count: number;
}

export interface DashboardDiagnosisResults {
  pregnant: number;
  empty: number;
}

export interface DashboardBreeding {
  activePregnancies: number;
  birthsLast30Days: number;
  servicesByMonth: DashboardMonthlyBirth[];
  diagnosisResults: DashboardDiagnosisResults;
}

export interface DashboardSelectionBreakdown {
  replacement: number;
  fattening: number;
  sale: number;
}

export interface DashboardMonthlyWeight {
  month: string;
  count: number;
  avgWeight: number | null;
}

export interface DashboardRearing {
  activeCount: number;
  avgWeight: number | null;
  selectionBreakdown: DashboardSelectionBreakdown;
  weightTrend: DashboardMonthlyWeight[];
}

export interface DashboardSystemBreakdown {
  field: number;
  feedlot: number;
}

export interface DashboardMonthlyFeedCost {
  month: string;
  cost: number;
}

export interface DashboardFattening {
  activeCount: number;
  avgWeight: number | null;
  systemBreakdown: DashboardSystemBreakdown;
  weightTrend: DashboardMonthlyWeight[];
  feedCostByMonth: DashboardMonthlyFeedCost[];
}

export interface DashboardMonthlyMovement {
  month: string;
  salesCount: number;
  salesAmount: number;
  purchasesCount: number;
  purchasesAmount: number;
}

export interface DashboardTrends {
  births: DashboardMonthlyBirth[];
  movements: DashboardMonthlyMovement[];
}

export interface DashboardStats {
  idRanch: number;
  herd: DashboardHerd;
  alerts: DashboardAlerts;
  movements: DashboardMovements;
  breeding: DashboardBreeding;
  rearing: DashboardRearing;
  fattening: DashboardFattening;
  trends: DashboardTrends;
}
