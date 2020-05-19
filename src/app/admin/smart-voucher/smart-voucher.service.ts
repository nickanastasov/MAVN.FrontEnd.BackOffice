import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';
import {SmartVoucherListResponse} from './models/smart-voucher-list-response.interface';
import {toParamsString} from 'src/app/shared/utils/common';
import {SmartVoucherCampaignSetImageRequest} from './models/set-image-request.interface';

@Injectable({
  providedIn: 'root',
})
export class SmartVoucherService {
  private apiPath = '/api/voucherCampaigns';

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

  setImage(model: SmartVoucherCampaignSetImageRequest, file: File) {
    const formData = new FormData();
    const paramsStr = toParamsString(model);
    formData.append('formFile', file, file.name);

    return this.apiHttp.post(this.apiPath + '/image' + paramsStr, formData);
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
