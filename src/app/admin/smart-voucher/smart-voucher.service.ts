import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';
import {SmartVoucherListResponse} from './models/smart-voucher-list-response.interface';

@Injectable({
  providedIn: 'root'
})
export class SmartVoucherService {
  apiPath = '/api/voucherCampaigns';

  constructor(private apiHttp: ApiHttpService) {}

  getAll(pageSize: number, currentPage: number, title: string) {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString())
      .set('CampaignName', title);

    return this.apiHttp.get<SmartVoucherListResponse>(this.apiPath, {params: params});
  }

  create(model: any) {
    return this.apiHttp.post<any>(this.apiPath, model);
  }

  delete(id: string) {
    return this.apiHttp.delete(`${this.apiPath}/${id}`);
  }
  getById(id: string) {
    return this.apiHttp.get(`${this.apiPath}/${id}`);
  }

  edit(model: any) {
    return this.apiHttp.put(this.apiPath, model);
  }
}
