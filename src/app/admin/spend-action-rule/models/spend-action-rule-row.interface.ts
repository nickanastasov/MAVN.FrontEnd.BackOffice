import {BusinessVerticalType} from '../../partners/models/business-vertical.enum';

export interface SpendActionRuleRow {
  Id: string;
  Title: string;
  AmountInTokens: string;
  AmountInCurrency: number;
  UsePartnerCurrencyRate: boolean;
  CreationDate: Date;
  Vertical?: BusinessVerticalType;
  Order: number;
}
