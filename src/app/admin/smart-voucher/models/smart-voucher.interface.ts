import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {SmartVoucherCampaignRow} from './smart-voucher-row.interface';
import {PartnersContainer} from '../../partners/models/partners-container.interface';

export class SmartVoucher extends SmartVoucherCampaignRow implements PartnersContainer {
  PartnerIds: string[];
  MobileContents: ActionRuleMobileContent[];
}
