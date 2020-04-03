export interface CustomerOperation {
  Timestamp: Date;
  TransactionId: string;
  TransactionType: string;
  CampaignName: string;
  WalletAddress: string;
  ReceiverCustomerId: string;
  PartnerId: string;
  Amount: number;
  AssetSymbol: string;
}
