import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {Transaction} from './transaction.interface';

export interface TransactionListResponse {
  Items: Transaction[];
  PagedResponse: PagedResponse;
}
