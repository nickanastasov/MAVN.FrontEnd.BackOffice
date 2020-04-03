import {BusinessVerticalType} from './business-vertical.enum';

export class Partner {
  Id: string;
  Name: string;
  AmountInTokens: string;
  AmountInCurrency: number;
  UseGlobalCurrencyRate: boolean;
  ClientId: string;
  ClientSecret: string;
  Description: string;
  Locations: Location[];
  BusinessVertical: BusinessVerticalType;

  constructor() {
    this.UseGlobalCurrencyRate = true;
  }
}
