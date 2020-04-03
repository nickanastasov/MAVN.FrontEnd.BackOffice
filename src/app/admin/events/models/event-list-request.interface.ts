import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';

export interface EventListRequest {
  PagedRequest: PageRequestModel;
  EventName?: string;
  EventSignature?: string;
  Address?: string;
  AffectedAddresses: string[];
}
