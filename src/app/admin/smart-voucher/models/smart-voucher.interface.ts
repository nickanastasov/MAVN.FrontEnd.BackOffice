import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {PartnersContainer} from '../../partners/models/partners-container.interface';

export class SmartVoucher implements PartnersContainer {
  Id: string;
  Title: string;
  Price: number;
  VouchersFile: File;
  VouchersCount: number;
  PartnerId: string;
  VouchersInStockCount: number;
  Description: string;
  BusinessVertical: string;
  PartnerIds: string[];
  AmountInTokens: string;
  AmountInCurrency: number;
  UsePartnerCurrencyRate: boolean;
  Order: number;
  LocalizedContents: ActionRuleMobileContent[];
}
