import {Injectable} from '@angular/core';
import {ChartPeriod} from '../models/chart-period.enum';
import {BasePeriodRequest} from '../models/base-period-request.interface';
import {Moment} from 'moment';
import * as moment from 'moment';
import {DATE_ONLY_FORMAT} from '../models/chart-constants';
import {Subject} from 'rxjs';
import {ChartPeriodInterface} from '../models/chart-period.interface';

@Injectable()
export class ChartPeriodService {
  private changeChartPeriod: Subject<ChartPeriod> = new Subject();
  private _chartPeriod: ChartPeriod = ChartPeriod.LastWeek;
  get chartPeriod() {
    return this._chartPeriod;
  }
  set chartPeriod(value: ChartPeriod) {
    this._chartPeriod = value;
    this.changeChartPeriod.next(value);
  }

  private changeCustomChartPeriod = new Subject();
  private _customChartPeriod = {from: moment.utc(), to: moment.utc()};
  get customChartPeriod() {
    return this._customChartPeriod;
  }
  set customChartPeriod(value: {from: Moment; to: Moment}) {
    this._customChartPeriod = value;
    this.changeCustomChartPeriod.next(value);
  }

  constructor() {}

  listenForChartPeriodChange() {
    return this.changeChartPeriod.asObservable();
  }

  listenForCustomChartPeriodChange() {
    return this.changeCustomChartPeriod.asObservable();
  }

  getChartPeriods() {
    return [ChartPeriod.LastWeek, ChartPeriod.LastTwoWeeks, ChartPeriod.LastMonth, ChartPeriod.LastHalfYear, ChartPeriod.Custom];
  }

  getChartPeriodsWithNames(): ChartPeriodInterface[] {
    return [
      {name: 'Week', value: ChartPeriod.LastWeek},
      {name: '2 Weeks', value: ChartPeriod.LastTwoWeeks},
      {name: 'Month', value: ChartPeriod.LastMonth},
      {name: 'Semester', value: ChartPeriod.LastHalfYear},
      {name: 'Custom', value: ChartPeriod.Custom}
    ];
  }

  fillDates(chartPeriod: ChartPeriod, chartPeriodFromDate: Moment, chartPeriodToDate: Moment, request: BasePeriodRequest) {
    switch (chartPeriod) {
      case ChartPeriod.LastTwoWeeks:
        request.FromDate = this.getMomentUtcToday()
          .add(-13, 'd')
          .format(DATE_ONLY_FORMAT);
        request.ToDate = this.getMomentUtcToday().format(DATE_ONLY_FORMAT);
        break;
      case ChartPeriod.LastMonth:
        request.FromDate = this.getMomentUtcToday()
          .add(-29, 'd')
          .format(DATE_ONLY_FORMAT);
        request.ToDate = this.getMomentUtcToday().format(DATE_ONLY_FORMAT);
        break;
      case ChartPeriod.LastHalfYear:
        request.FromDate = this.getMomentUtcToday()
          .add(-179, 'd')
          .format(DATE_ONLY_FORMAT);
        request.ToDate = this.getMomentUtcToday().format(DATE_ONLY_FORMAT);
        break;
      case ChartPeriod.Custom:
        request.FromDate = chartPeriodFromDate.format(DATE_ONLY_FORMAT);
        request.ToDate = chartPeriodToDate.format(DATE_ONLY_FORMAT);
        break;
      case ChartPeriod.LastWeek:
      default:
        request.FromDate = this.getMomentUtcToday()
          .add(-6, 'd')
          .format(DATE_ONLY_FORMAT);
        request.ToDate = this.getMomentUtcToday().format(DATE_ONLY_FORMAT);
        break;
    }
  }

  private getMomentUtcToday(): Moment {
    return moment.utc().startOf('day');
  }
}
