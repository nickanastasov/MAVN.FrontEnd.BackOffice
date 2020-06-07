import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  apiPath = '/api/Kyc';
  constructor(private apiHttp: ApiHttpService) {}

  getById(id: string) {
    const params = new HttpParams().set('partnerId', encodeURIComponent(id));
    return this.apiHttp.get<any>(this.apiPath + '/current', {params: params});
  }
}
