import {CustomerRow} from './customer-row.interface';
import {PagedResponse} from '../../../shared/pagination-container/models/paged-response.interface';

export interface CustomerListResponse {
  Customers: CustomerRow[];
  PagedResponse: PagedResponse;
}
