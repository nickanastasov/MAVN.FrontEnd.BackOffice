export interface Transaction {
  Id: string;
  Timestamp: Date;
  Amount: string;
  TransactionType: string;
  Status: string;
  Vertical: string;
  TransactionCategory: string;
  CampaignName: string;
  Info: string;
  SenderName: string;
  SenderEmail: string;
  ReceiverName: string;
  ReceiverEmail: string;
  LocationInfo: string;
  LocationExternalId: string;
  LocationIntegrationCode: string;
}
