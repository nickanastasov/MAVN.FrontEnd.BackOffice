import {Partner} from '../models/partner.interface';
import {Provider} from '../models/provider.interface';
export interface PartnerInfo {
  partnerDetails: Partner;
  partnerProviderDetails: Provider;
}
