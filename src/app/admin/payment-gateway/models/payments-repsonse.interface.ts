import {Payment} from './payment.interface';
import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';

export interface PaymentsResponse {
  Items: Payment[];
  PagedResponse: PagedResponse;
}
