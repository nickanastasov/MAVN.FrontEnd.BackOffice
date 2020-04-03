import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {LeadsListRequest} from '../leads-chart/models/leads-list-request.interface';
import {LeadsListResponse} from '../leads-chart/models/leads-list-response.interface';
import {toParamsString} from 'src/app/shared/utils/common';

@Injectable()
export class LeadsStatisticsService {
  constructor(private apiHttp: ApiHttpService) {}

  getChartStatistics(model: LeadsListRequest) {
    const paramsStr = toParamsString(model);

    return this.apiHttp.get<LeadsListResponse>('/api/dashboard/leads' + paramsStr);
  }
}
