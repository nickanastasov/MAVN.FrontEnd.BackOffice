import {ApiHttpService} from 'ngx-api-utils';
import {Injectable} from '@angular/core';
import {BasePeriodRequest} from '../models/base-period-request.interface';
import {toParamsString} from 'src/app/shared/utils/common';
import {CustomersStatisticResponse} from '../customers-chart/models/customers-statistic-response.interface';

@Injectable()
export class CustomersStatisticsService {
  constructor(private apiHttp: ApiHttpService) {}

  getChartStatistics(model: BasePeriodRequest) {
    const paramsStr = toParamsString(model);

    return this.apiHttp.get<CustomersStatisticResponse>('/api/dashboard/customers' + paramsStr);
  }
}
