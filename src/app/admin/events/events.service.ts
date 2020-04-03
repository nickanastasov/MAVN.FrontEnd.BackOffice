import {EventListRequest} from './models/event-list-request.interface';
import {Injectable} from '@angular/core';
import {Event} from './models/event.interface';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';
import {EventListResponse} from './models/event-list-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(private apiHttp: ApiHttpService) {}

  getAll(request: EventListRequest) {
    let params = new HttpParams();
    if (!!request.Address && request.Address.trim() !== '') {
      params = params.set('Address', request.Address.toString());
    }

    if (!!request.EventName && request.EventName.trim() !== '') {
      params = params.set('EventName', request.EventName.toString());
    }

    if (!!request.EventSignature && request.EventSignature.trim() !== '') {
      params = params.set('EventSignature', request.EventSignature.toString());
    }

    if (!!request.Address && request.Address.trim() !== '') {
      params = params.set('Address', request.Address.toString());
    }

    if (!request.AffectedAddresses.every(a => a.trim() === '')) {
      request.AffectedAddresses.forEach(a => {
        params = params.append('AffectedAddresses', a);
      });
    }

    params = params.set('PagedRequest.PageSize', request.PagedRequest.PageSize.toString());
    params = params.set('PagedRequest.CurrentPage', request.PagedRequest.CurrentPage.toString());

    return this.apiHttp.get<EventListResponse>('/api/events', {params: params});
  }

  getById(id: string) {
    return this.apiHttp.get<Event>(`/api/events/${encodeURIComponent(id)}`);
  }
}
