import {OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {Moment} from 'moment';
import * as moment from 'moment';

import {ChartPeriodService} from '../services/chart-period.service';
import {ChartPeriod} from './chart-period.enum';

export class PeriodChangeComponent implements OnInit, OnDestroy {
  chartPeriodSubscription: Subscription;
  customChartPeriodSubscription: Subscription;
  chartPeriod: ChartPeriod = ChartPeriod.LastWeek;
  chartPeriodFromDate: Moment = moment.utc().add(-6, 'd');
  chartPeriodToDate: Moment = moment.utc();

  private _chartPeriodService: ChartPeriodService;

  constructor(chartPeriodService: ChartPeriodService) {
    this._chartPeriodService = chartPeriodService;
  }

  load() {}

  ngOnInit() {
    this.chartPeriodSubscription = this._chartPeriodService.listenForChartPeriodChange().subscribe((newChartPeriod: ChartPeriod) => {
      this.chartPeriod = newChartPeriod;
      this.load();
    });

    this.customChartPeriodSubscription = this._chartPeriodService
      .listenForCustomChartPeriodChange()
      .subscribe((newCustomChartPeriod: {from: Moment; to: Moment}) => {
        this.chartPeriodFromDate = newCustomChartPeriod.from;
        this.chartPeriodToDate = newCustomChartPeriod.to;
        this.load();
      });
  }

  ngOnDestroy() {
    this.chartPeriodSubscription.unsubscribe();
    this.customChartPeriodSubscription.unsubscribe();
  }
}
