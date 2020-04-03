import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {Tier} from './models/tier.interface';

@Injectable()
export class TiersService {
  constructor(private apiHttp: ApiHttpService) {}

  getAll() {
    return this.apiHttp.get<Tier[]>(`/api/tiers`);
  }
}
