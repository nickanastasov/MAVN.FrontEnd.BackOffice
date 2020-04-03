import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {SpendActionRule} from './models/spend-action-rule.interface';
import {HttpParams} from '@angular/common/http';
import {SpendActionRuleListResponse} from './models/spend-action-rule-list-response.interface';
import {ImageAddRequest} from '../action-rule/models/image-add-request.interface';
import {CreateSpendActionRuleResponse} from './models/create-spend-action-rule-response.interface';
import {ImageEditRequest} from '../action-rule/models/image-edit-request.interface';
import {toParamsString} from 'src/app/shared/utils/common';

@Injectable({
  providedIn: 'root'
})
export class SpendActionRuleService {
  apiPath = '/api/burnRules';

  constructor(private apiHttp: ApiHttpService) {}

  getAll(pageSize: number, currentPage: number, title: string) {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString())
      .set('title', title);

    return this.apiHttp.get<SpendActionRuleListResponse>(this.apiPath, {params: params});
  }

  create(model: SpendActionRule) {
    return this.apiHttp.post<CreateSpendActionRuleResponse>(this.apiPath, model);
  }

  addImage(model: ImageAddRequest, file: File) {
    const formData = new FormData();
    formData.append('formFile', file, file.name);
    const paramsStr = toParamsString(model);
    // !!! HttpParams {params: params} doesn't work
    return this.apiHttp.post(this.apiPath + '/image' + paramsStr, formData);
  }

  edit(model: SpendActionRule) {
    return this.apiHttp.put(this.apiPath, model);
  }

  editImage(model: ImageEditRequest, file: File) {
    const formData = new FormData();
    formData.append('formFile', file, file.name);
    const paramsStr = toParamsString(model);
    // !!! HttpParams {params: params} doesn't work
    return this.apiHttp.put(this.apiPath + '/image' + paramsStr, formData);
  }

  uploadVouchers(spendRuleId: string, file: File) {
    const formData = new FormData();
    formData.append('formFile', file, file.name);
    const paramsStr = toParamsString({spendRuleId: spendRuleId});
    // !!! HttpParams {params: params} doesn't work
    return this.apiHttp.post(this.apiPath + '/vouchers' + paramsStr, formData);
  }

  getById(id: string) {
    const params = new HttpParams().set('id', encodeURIComponent(id));

    return this.apiHttp.get<SpendActionRule>(`${this.apiPath}/query`, {params: params});
  }

  delete(id: string) {
    const params = new HttpParams().set('id', encodeURIComponent(id));

    return this.apiHttp.delete(`${this.apiPath}`, {params: params});
  }
}
