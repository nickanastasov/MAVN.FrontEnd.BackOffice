import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {SmartVoucherRow} from './smart-voucher-row.interface';

export interface SmartVoucherListResponse {
  SmartVoucherCampaigns: SmartVoucherRow[];
  PagedResponse: PagedResponse;
}
