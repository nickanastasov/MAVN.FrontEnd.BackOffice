import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {ChartPeriod} from '../models/chart-period.enum';
import {Moment} from 'moment';
import * as moment from 'moment';
import {CustomersStatisticResponse} from './models/customers-statistic-response.interface';
import {CustomersStatisticsService} from '../services/customers-statistics.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {MatSnackBar, MatTooltip} from '@angular/material';
import {DAY_FORMAT} from '../models/chart-constants';
import {ChartPeriodService} from '../services/chart-period.service';
import {BasePeriodRequest} from '../models/base-period-request.interface';
import {ChartData, ChartDataSets} from 'chart.js';
import * as Chart from 'chart.js';
import {ChartjsLineChartConfiguration} from '../models/chartjs/chartjs-line-chart-configuration.class';
import {ChartjsUtilsService} from '../services/chartjs-utils.service';
import {Subscription} from 'rxjs';
import {PeriodChangeComponent} from '../models/period-change-component';
import {SmallGraphicItem} from '../small-graphic-boxes/small-graphic-item.interface';
import {BRAND_SECOND_CHART_COLOR, BRAND_COLOR} from 'src/app/core/constants/const';
import {CustomersCount} from './models/customers-count.interface';

@Component({
  selector: 'app-customers-chart',
  templateUrl: './customers-chart.component.html',
  styleUrls: ['./customers-chart.component.scss'],
  providers: [DecimalPipe]
})
export class CustomersChartComponent extends PeriodChangeComponent implements OnInit {
  chartPeriodSubscription: Subscription;
  isLoading = true;
  isFirstLoading = true;
  chartPeriod: ChartPeriod = ChartPeriod.LastWeek;
  chartPeriods: ChartPeriod[] = this.chartPeriodService.getChartPeriods();
  chartPeriodFromDate: Moment = moment.utc().add(-6, 'd');
  chartPeriodToDate: Moment = moment.utc();
  chartPeriodMaxDate: Moment = moment.utc();
  ChartPeriod = ChartPeriod;
  response: CustomersStatisticResponse;
  smallGraphicItems: SmallGraphicItem[] = [];
  dropdownData: any[] = [
    {label: 'New Customers', value: 'NEW'},
    {label: 'Total number of customers', value: 'TOTAL', isDisabled: true}
  ];
  // private
  private lineChartConfiguration: ChartjsLineChartConfiguration;
  private lineChart: Chart;

  @Output() totalCustomersCount = new EventEmitter<CustomersCount>();

  // #region translates
  @ViewChild('lineChartLabelTemplate')
  lineChartLabelTemplate: ElementRef<HTMLElement>;
  @ViewChild('newCustomersTooltipTemplate')
  newCustomersTooltipTemplate: ElementRef<HTMLElement>;

  @ViewChild('donutActiveCustomersLabelTemplate')
  donutActiveCustomersLabelTemplate: ElementRef<HTMLElement>;
  @ViewChild('activeCustomersTooltipTemplate')
  activeCustomersTooltipTemplate: ElementRef<HTMLElement>;

  @ViewChild('donutNonActiveCustomersLabelTemplate')
  donutNonActiveCustomersLabelTemplate: ElementRef<HTMLElement>;
  @ViewChild('nonActiveCustomersTooltipTemplate')
  nonActiveCustomersTooltipTemplate: ElementRef<HTMLElement>;

  @ViewChild('tooltipWrapper')
  tooltipWrapper: ElementRef<HTMLElement>;
  @ViewChild('tooltip')
  tooltip: MatTooltip;

  private translates = {
    donutActiveCustomersLabel: '',
    activeCustomersTooltip: '',
    donutNonActiveCustomersLabel: '',
    nonActiveCustomersTooltip: ''
  };
  translatesForTemplate = {
    lineChartLabel: '',
    newCustomersTooltip: ''
  };
  // #endregion

  // tslint:disable-next-line: prettier
  constructor(
    private customersStatisticsService: CustomersStatisticsService,
    private chartPeriodService: ChartPeriodService,
    private decimalPipe: DecimalPipe,
    private chartjsUtilsService: ChartjsUtilsService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {
    super(chartPeriodService);
  }

  ngOnInit() {
    // translates
    this.translatesForTemplate.lineChartLabel = this.lineChartLabelTemplate.nativeElement.innerText;
    this.translatesForTemplate.newCustomersTooltip = this.newCustomersTooltipTemplate.nativeElement.innerText;
    this.translates.donutActiveCustomersLabel = this.donutActiveCustomersLabelTemplate.nativeElement.innerText;
    this.translates.activeCustomersTooltip = this.activeCustomersTooltipTemplate.nativeElement.innerText;
    this.translates.donutNonActiveCustomersLabel = this.donutNonActiveCustomersLabelTemplate.nativeElement.innerText;
    this.translates.nonActiveCustomersTooltip = this.nonActiveCustomersTooltipTemplate.nativeElement.innerText;

    this.lineChartConfiguration = Object.assign(new ChartjsLineChartConfiguration(), {
      options: {
        title: {
          display: false
        },
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        tooltips: {
          displayColors: false,
          intersect: false,
          mode: 'index',
          callbacks: {
            label: (tooltipItem: Chart.ChartTooltipItem, data: ChartData) => {
              return this.chartjsUtilsService.applyNumberSeparatorsToTooltips(tooltipItem, data, this.decimalPipe);
            }
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                drawBorder: false,
                display: false
              }
            }
          ],
          yAxes: [
            {
              gridLines: {
                drawBorder: false,
                borderDash: [6, 4],
                color: '#d8dffd'
              },
              ticks: {
                callback: (value: any) => {
                  return this.decimalPipe.transform(value);
                },
                padding: 5
              }
            }
          ]
        },
        elements: {
          point: {
            radius: 0,
            borderWidth: 0,
            hoverRadius: 0,
            hoverBorderWidth: 0
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        }
      }
    });

    super.ngOnInit();
    this.load();
  }

  load() {
    const request = {} as BasePeriodRequest;

    this.chartPeriodService.fillDates(this.chartPeriod, this.chartPeriodFromDate, this.chartPeriodToDate, request);

    this.isLoading = true;

    this.customersStatisticsService.getChartStatistics(request).subscribe(
      (res: CustomersStatisticResponse) => {
        this.response = res;
        this.updateChartsData();
        this.drawCharts();

        this.isLoading = false;
        this.isFirstLoading = false;

        this.smallGraphicItems = [
          {
            title: 'CHANGE FOR PERIOD',
            number: res.TotalNewCustomers,
            color: 'blue',
            tooltip: this.translatesForTemplate.newCustomersTooltip,
            data: this.lineChartConfiguration.data
          },
          // {
          //   title: 'ACTIVE CUSTOMERS',
          //   number: res.TotalActiveCustomers,
          //   percentage: (res.TotalActiveCustomers / res.TotalCustomers) * 100,
          //   color: 'green',
          //   tooltip: this.translates.activeCustomersTooltip
          // },
          {
            title: 'NON-ACTIVE CUSTOMERS',
            number: res.TotalNonActiveCustomers,
            percentage: (res.TotalNonActiveCustomers / res.TotalCustomers) * 100,
            color: 'red',
            tooltip: this.translates.nonActiveCustomersTooltip
          }
        ];

        this.totalCustomersCount.emit({
          TotalCustomers: this.response.TotalCustomers,
          TotalNewCustomers: res.TotalNewCustomers,
          TotalActiveCustomers: res.TotalActiveCustomers
        });
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isLoading = false;
      }
    );
  }

  chartPeriodChanged() {
    if (this.chartPeriod !== ChartPeriod.Custom) {
      this.load();
    }
  }

  applyCustomChartPeriod() {
    this.load();
  }

  private updateChartsData() {
    this.updateLineChartData();
  }

  private updateLineChartData() {
    if (!this.response) {
      return;
    }

    const data: ChartData = {};
    data.labels = [];
    data.datasets = [];

    const newCustomersDataSet: ChartDataSets = {
      backgroundColor: BRAND_SECOND_CHART_COLOR,
      borderColor: BRAND_COLOR,
      label: this.translatesForTemplate.lineChartLabel
    };

    const points: number[] = [];

    for (let i = 0, l = this.response.NewCustomers.length; i < l; i++) {
      const newCustomer = this.response.NewCustomers[i];
      const day = moment(newCustomer.Day).format(DAY_FORMAT);

      // put dates
      data.labels.push(day);

      // put points
      points.push(newCustomer.Count);
    }

    newCustomersDataSet.data = points;
    data.datasets.push(newCustomersDataSet);
    this.lineChartConfiguration.data = data;
  }

  private drawCharts() {
    this.drawLineChart();
  }

  private drawLineChart() {
    if (!this.lineChartConfiguration.data || !this.lineChartConfiguration.data.datasets.length) {
      return;
    }

    if (this.lineChart) {
      this.lineChart.data = this.lineChartConfiguration.data;
      this.lineChart.update();
    } else {
      this.lineChart = new Chart('customers-line-chart', this.lineChartConfiguration);
    }
  }
}
