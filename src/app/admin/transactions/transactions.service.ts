import {TransactionListRequest} from './models/transaction-list-request.interface';
import {TransactionListResponse} from './models/transaction-list-response.interface';
import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {toParamsString} from 'src/app/shared/utils/common';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(private apiHttp: ApiHttpService) {}

  getAll(request: TransactionListRequest) {
    return this.apiHttp.post<TransactionListResponse>('/api/Reports', request);
  }

  exportToCsv(model: any) {
    const paramsStr = toParamsString(model);

    return this.apiHttp.get<Blob>('/api/Reports/exportToCsv' + paramsStr, {
      responseType: 'blob' as any,
    });
  }
}
