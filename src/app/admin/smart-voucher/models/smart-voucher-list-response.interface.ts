import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {SmartVoucherCampaignRow} from './smart-voucher-row.interface';

export interface SmartVoucherListResponse {
  SmartVoucherCampaigns: SmartVoucherCampaignRow[];
  PagedResponse: PagedResponse;
}
