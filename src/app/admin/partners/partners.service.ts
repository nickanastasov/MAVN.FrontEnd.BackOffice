import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {Partner} from './models/partner.interface';
import {HttpParams} from '@angular/common/http';
import {PartnersListResponse} from './models/partners-list-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PartnersService {
  apiPath = '/api/partners';

  constructor(private apiHttp: ApiHttpService) {}

  getAll(pageSize: number, currentPage: number, name: string) {
    const params = new HttpParams().set('pageSize', pageSize.toString()).set('currentPage', currentPage.toString()).set('name', name);

    return this.apiHttp.get<PartnersListResponse>(this.apiPath, {params: params});
  }

  getById(id: string) {
    const params = new HttpParams().set('id', encodeURIComponent(id));

    return this.apiHttp.get<Partner>(`/api/partners/query`, {params: params});
  }

  add(partner: Partner) {
    return this.apiHttp.post('/api/partners', partner);
  }
  update(partner: Partner) {
    return this.apiHttp.put('/api/partners', partner);
  }

  generateClientIdAsync() {
    return this.apiHttp.post('/api/partners/generateClientId', null);
  }

  generateClientSecretAsync() {
    return this.apiHttp.post('/api/partners/generateClientSecret', null);
  }
}
