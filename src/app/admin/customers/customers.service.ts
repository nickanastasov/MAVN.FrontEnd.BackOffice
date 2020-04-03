import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {HttpParams} from '@angular/common/http';
import {CustomerListResponse} from './models/customer-list-response.interface';
import {CustomerOperationsHistoryResponse} from './models/customer-operations-history-response.interface';
import {Balance} from './models/balance.interface';
import {CustomerWalletAddressResponse} from './models/customer-wallet-address-response';
import {CustomerPublicWalletAddressResponse} from './models/customer-public-wallet-address-response.interface';
import {CustomerDetails} from './models/customer-details.interface';

@Injectable()
export class CustomersService {
  apiPath = '/api/customers';

  constructor(private apiHttp: ApiHttpService) {}

  get(pageSize: number, currentPage: number, searchValue: string) {
    // purpose is to avoid putting details into AppInsights
    return this.apiHttp.post<CustomerListResponse>(this.apiPath + '/search', {
      pageSize: pageSize,
      currentPage: currentPage,
      searchValue: searchValue
    });
  }

  getCustomerById(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.get<CustomerDetails>(`${this.apiPath}/query`, {params: params});
  }

  getCustomerOperationsById(pageSize: number, currentPage: number, customerId: string) {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString())
      .set('customerId', customerId);

    return this.apiHttp.get<CustomerOperationsHistoryResponse>(`${this.apiPath}/history`, {params: params});
  }

  getBalance(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.get<Balance>(`${this.apiPath}/balance`, {params: params});
  }

  getWalletAddress(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.get<CustomerWalletAddressResponse>(`${this.apiPath}/walletAddress`, {params: params});
  }

  getPublicWalletAddress(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.get<CustomerPublicWalletAddressResponse>(`${this.apiPath}/publicWalletAddress`, {params: params});
  }

  blockCustomer(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.post(`${this.apiPath}/block`, null, {params: params});
  }

  unblockCustomer(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.post(`${this.apiPath}/unblock`, null, {params: params});
  }

  blockWallet(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.post(`${this.apiPath}/blockWallet`, null, {params: params});
  }

  unblockWallet(customerId: string) {
    const params = new HttpParams().set('customerId', encodeURIComponent(customerId));

    return this.apiHttp.post(`${this.apiPath}/unblockWallet`, null, {params: params});
  }
}
