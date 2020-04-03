import {ApiHttpService} from 'ngx-api-utils';
import {TokensStatistics} from '../models/tokens-statistics.interface';
import {Injectable} from '@angular/core';
import {BasePeriodRequest} from '../models/base-period-request.interface';
import {toParamsString} from 'src/app/shared/utils/common';
import {TokensListResponse} from '../tokens-chart/models/tokens-list-response.interface';

@Injectable()
export class TokensStatisticsService {
  constructor(private apiHttp: ApiHttpService) {}

  get() {
    return this.apiHttp.get<TokensStatistics>('/api/statistics/tokens-current');
  }

  getChartStatistics(model: BasePeriodRequest) {
    const paramsStr = toParamsString(model);

    return this.apiHttp.get<TokensListResponse>('/api/dashboard/tokens' + paramsStr);
  }
}
