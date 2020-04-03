import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {CustomerOperation} from './customer-operation.interface';

export interface CustomerOperationsHistoryResponse {
  Operations: CustomerOperation[];
  PagedResponse: PagedResponse;
}
