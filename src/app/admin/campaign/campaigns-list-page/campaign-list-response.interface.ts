import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {EarnRuleRow} from '../models/earn-rule-row.interface';

export interface CampaignListResponse {
  EarnRules: EarnRuleRow[];
  PagedResponse: PagedResponse;
}
