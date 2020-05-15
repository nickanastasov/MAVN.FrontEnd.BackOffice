import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {PaymentProvidersResponse} from '../models/payment-providers-response.interface';
import {HttpParams} from '@angular/common/http';
import {Provider} from '../models/provider.interface';
import {CheckPaymentIntegrationResponse} from '../models/check-payment-integration-response.inteface';
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
  checkPaymentIntegration(model: any) {
    return this.apiHttp.post<CheckPaymentIntegrationResponse>(`${this.apiPath}/integration/check`, model);
  }
  getById(id: string) {
    const params = new HttpParams().set('partnerId', encodeURIComponent(id));
    return this.apiHttp.get<any>(this.apiPath, {params: params});
  }

  update(model: Provider) {
    return this.apiHttp.put<Provider>(this.apiPath, model);
  }
}
