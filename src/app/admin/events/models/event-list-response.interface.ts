import {PagedResponse} from 'src/app/shared/pagination-container/models/paged-response.interface';
import {Event} from './event.interface';

export interface EventListResponse {
  PagedResponse: PagedResponse;
  Events: Event[];
}
