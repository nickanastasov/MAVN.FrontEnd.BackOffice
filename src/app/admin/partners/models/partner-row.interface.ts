import {BusinessVerticalType} from './business-vertical.enum';

export interface PartnerRowResponse {
  Id: string;
  Name: string;
  AmountInTokens: string;
  AmountInCurrency: number;
  UseGlobalCurrencyRate: boolean;
  CreatedAt: Date;
  CreatedBy: string;
  BusinessVertical?: BusinessVerticalType;
  IsHidden: boolean;

  Currency: number;
}
