import {ApiHttpService} from 'ngx-api-utils';
import {Injectable} from '@angular/core';
import {TokensSupply} from '../models/token-supply.interface';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor(private apiHttp: ApiHttpService) {}

  getTotalSupplyTokens() {
    return this.apiHttp.get<TokensSupply>('/api/statistics/total-supply');
  }
}
