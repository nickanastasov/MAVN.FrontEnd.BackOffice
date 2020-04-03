export interface TokensListResponse {
  Earn: PeriodTokensStatistics[];
  Burn: PeriodTokensStatistics[];
  WalletBalance: PeriodTokensStatistics[];
  TotalEarn: number;
  TotalBurn: number;
  TotalWalletBalance: number;
}

export interface PeriodTokensStatistics {
  Day: Date;

  Amount: number;
}
