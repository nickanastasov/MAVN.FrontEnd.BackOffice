import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';
import {PaymentsResponse} from './models/payments-repsonse.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  apiPath = '/api/payments';

  constructor(private apiHttp: ApiHttpService) {}

  getAll(pageSize: number, currentPage: number) {
    const params = new HttpParams().set('pageSize', pageSize.toString()).set('currentPage', currentPage.toString());

    return this.apiHttp.get<PaymentsResponse>(`${this.apiPath}/unprocessed`, {params: params});
  }

  approve(paymentId: string) {
    const params = new HttpParams().set('paymentId', encodeURIComponent(paymentId));

    return this.apiHttp.post(`${this.apiPath}/accepted`, null, {params: params});
  }

  decline(paymentId: string) {
    const params = new HttpParams().set('paymentId', encodeURIComponent(paymentId));

    return this.apiHttp.post(`${this.apiPath}/rejected`, null, {params: params});
  }
}
