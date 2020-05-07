import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {PaymentProvidersResponse} from '../models/payment-providers-response.interface';
import {HttpParams} from '@angular/common/http';
import {Provider, PaymentDetails} from '../models/provider.interface';
@Injectable({
  providedIn: 'root',
})
export class PaymentProvidersService {
  apiPath = '/api/PaymentProviderDetails';
  constructor(private apiHttp: ApiHttpService) {}

  getAll() {
    return this.apiHttp.get<PaymentProvidersResponse>(this.apiPath + '/properties');
  }

  create(model: Provider) {
    return this.apiHttp.post<Provider>(this.apiPath, model);
  }
  checkPaymentIntegration(id: string) {
    const params = new HttpParams().set('PartnerId', encodeURIComponent(id));
    return this.apiHttp.get<any>(`${this.apiPath}/integration/check`, {params: params});
  }
  getById(id: string) {
    const params = new HttpParams().set('partnerId', encodeURIComponent(id));
    return this.apiHttp.get<any>(this.apiPath, {params: params});
  }

  update(model: Provider) {
    return this.apiHttp.put<Provider>(this.apiPath, model);
  }
}
