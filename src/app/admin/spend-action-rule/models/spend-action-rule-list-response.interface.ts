import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {SpendActionRuleRow} from './spend-action-rule-row.interface';

export interface SpendActionRuleListResponse {
  BurnRules: SpendActionRuleRow[];
  PagedResponse: PagedResponse;
}
