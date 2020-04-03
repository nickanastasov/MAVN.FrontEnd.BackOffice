import {User} from './user.interface';
import {PagedResponse} from '../../../shared/pagination-container/models/paged-response.interface';

export interface AdminListResponse {
  Items: User[];
  PagedResponse: PagedResponse;
}
