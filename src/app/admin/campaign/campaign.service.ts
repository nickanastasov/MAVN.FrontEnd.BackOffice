import {Injectable} from '@angular/core';
import {Campaign} from './models/campaign.interface';
import {BonusType} from './models/bonus-type.interface';
import {ApiHttpService} from 'ngx-api-utils';
import {CampaignListResponse} from './campaigns-list-page/campaign-list-response.interface';
import {HttpParams} from '@angular/common/http';
import {CreateEarnActionRuleResponse} from './models/create-earn-action-rule-response.interface';
import {ImageAddRequest} from '../action-rule/models/image-add-request.interface';
import {ImageEditRequest} from '../action-rule/models/image-edit-request.interface';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  apiPath = '/api/earnRules';

  constructor(private apiHttp: ApiHttpService) {}

  getAll(pageSize: number, currentPage: number, name: string) {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString())
      .set('earnRuleName', name);

    return this.apiHttp.get<CampaignListResponse>(this.apiPath, {params: params});
  }

  create(campaign: Campaign) {
    return this.apiHttp.post<CreateEarnActionRuleResponse>(this.apiPath, campaign);
  }

  addImage(model: ImageAddRequest, file: File) {
    const formData = new FormData();
    const params: {key: string; value: string}[] = [];

    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        const prop = (model as any)[key];
        // formData.append(key, prop);
        params.push({key, value: prop.toString()});
      }
    }

    const paramsStr = '?' + params.map(param => `${param.key}=${param.value}`).join('&');

    formData.append('formFile', file, file.name);

    // !!! HttpParams {params: params} doesn't work
    return this.apiHttp.post(this.apiPath + '/image' + paramsStr, formData);
  }

  edit(campaign: Campaign) {
    return this.apiHttp.put(this.apiPath, campaign);
  }

  editImage(model: ImageEditRequest, file: File) {
    const formData = new FormData();
    const params: {key: string; value: string}[] = [];

    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        const prop = (model as any)[key];
        // formData.append(key, prop);
        params.push({key, value: prop.toString()});
      }
    }

    const paramsStr = '?' + params.map(param => `${param.key}=${param.value}`).join('&');

    formData.append('formFile', file, file.name);

    // !!! HttpParams {params: params} doesn't work
    return this.apiHttp.put(this.apiPath + '/image' + paramsStr, formData);
  }

  getById(id: string) {
    const params = new HttpParams().set('id', encodeURIComponent(id));

    return this.apiHttp.get<Campaign>(`${this.apiPath}/query`, {params: params});
  }

  getBonusTypes() {
    return this.apiHttp.get<BonusType[]>('/api/bonusTypes');
  }

  delete(campaignId: string) {
    const params = new HttpParams().set('earnRuleId', encodeURIComponent(campaignId));

    return this.apiHttp.delete(`${this.apiPath}`, {params: params});
  }
}
