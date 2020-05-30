import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {Partner} from './models/partner.interface';
import {HttpParams} from '@angular/common/http';
import {PartnersListResponse} from './models/partners-list-response.interface';
import {toParamsString} from 'src/app/shared/utils/common';
import {CheckPartnerAbilityResponse} from './models/response/check-partner-ability-respnse.interface';
import {LinkingInfoResponse} from './models/response/linking-info-response.interface';

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

    return this.apiHttp.get<Partner>(this.apiPath + '/query', {params: params});
  }

  add(partner: Partner) {
    return this.apiHttp.post(this.apiPath, partner);
  }
  update(partner: Partner) {
    return this.apiHttp.put(this.apiPath, partner);
  }

  generateClientIdAsync() {
    return this.apiHttp.post(this.apiPath + '/generateClientId', null);
  }

  generateClientSecretAsync() {
    return this.apiHttp.post(this.apiPath + '/generateClientSecret', null);
  }

  checkAbilityToPublish(partnerId: string) {
    const model = {
      PartnerAbility: 'PublishSmartVoucherCampaign',
      PartnerId: partnerId,
    };

    const paramsStr = toParamsString(model);

    return this.apiHttp.get<CheckPartnerAbilityResponse>(this.apiPath + '/ability/check' + paramsStr);
  }

  getLinkingInfo(partnerId: string) {
    const paramsStr = toParamsString({
      PartnerId: partnerId,
    });

    return this.apiHttp.get<LinkingInfoResponse>(this.apiPath + '/linking/info' + paramsStr);
  }

  regenerateLinkingInfo(partnerId: string) {
    const model = {
      PartnerId: partnerId,
    };

    return this.apiHttp.post(this.apiPath + '/linking/info', model);
  }
}
