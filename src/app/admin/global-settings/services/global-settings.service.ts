import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {GlobalRate} from '../models/global-rate.interface';
import {AgentRequirements} from '../models/agent-requirements.interface';
import {OperationFee} from '../models/operation-fees.interface';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {
  apiPath = '/api/Settings';

  constructor(private apiHttp: ApiHttpService) {}

  getGlobalRate() {
    return this.apiHttp.get<GlobalRate>(this.apiPath + '/globalCurrencyRate');
  }

  updateGlobalRate(model: GlobalRate) {
    return this.apiHttp.put(this.apiPath + '/globalCurrencyRate', model);
  }

  getAgentRequirements() {
    return this.apiHttp.get<AgentRequirements>(this.apiPath + '/agentRequirements');
  }

  updateAgentRequirements(model: AgentRequirements) {
    return this.apiHttp.put(this.apiPath + '/agentRequirements', model);
  }

  getOperationFees() {
    return this.apiHttp.get<OperationFee>(this.apiPath + '/operationFees');
  }

  updateOperationFees(model: OperationFee) {
    return this.apiHttp.put(this.apiPath + '/operationFees', model);
  }
}
