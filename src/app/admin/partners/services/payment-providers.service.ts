import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {PaymentProvidersResponse} from '../models/payment-providers-response.interface';
@Injectable({
  providedIn: 'root',
})
export class PaymentProvidersService {
  apiPath = '/api/PaymentProviderDetails';
  constructor(private apiHttp: ApiHttpService) {}

  getAll() {
    return this.apiHttp.get<PaymentProvidersResponse>(this.apiPath + '/properties');
  }

  create(model: any) {
    return this.apiHttp.post<any>(this.apiPath, model);
  }
}
