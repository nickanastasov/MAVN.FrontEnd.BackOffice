import {LeadState} from './lead-state.enum';

export interface LeadsListResponse {
  Leads: LeadsStatisticsForDayReportModel[];
  TotalNumber: number;
}

export interface LeadsStatisticsForDayReportModel {
  Day: Date;
  Value: LeadsStatistics[];
  Total: number;
}

export interface LeadsStatistics {
  State: LeadState;
  Count: number;
}
