import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {PartnerRowResponse} from './partner-row.interface';

export interface PartnersListResponse {
  PagedResponse: PagedResponse;
  Partners: PartnerRowResponse[];
}
