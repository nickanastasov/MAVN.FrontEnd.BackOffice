import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {ChartPeriod} from '../models/chart-period.enum';
import {Moment} from 'moment';
import * as moment from 'moment';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {MatSnackBar} from '@angular/material';
import {DAY_FORMAT} from '../models/chart-constants';
import {ChartPeriodService} from '../services/chart-period.service';
import {BasePeriodRequest} from '../models/base-period-request.interface';
import * as Chart from 'chart.js';
import {ChartjsUtilsService} from '../services/chartjs-utils.service';
import {TOKEN_SYMBOL, BRAND_SECOND_CHART_COLOR, BRAND_COLOR} from 'src/app/core/constants/const';
import {TokensListResponse, PeriodTokensStatistics} from './models/tokens-list-response.interface';
import {TokensStatisticsService} from '../services/tokens-statistics.service';
import {TokensStatistics} from '../models/tokens-statistics.interface';
import {RoundToAccuracy} from 'src/app/shared/utils/common';
import {PeriodChangeComponent} from '../models/period-change-component';
import {SmallGraphicItem} from '../small-graphic-boxes/small-graphic-item.interface';
import {ChartjsLineChartConfiguration} from '../models/chartjs/chartjs-line-chart-configuration.class';
import {ChartData} from 'chart.js';

@Component({
  selector: 'app-tokens-chart',
  templateUrl: './tokens-chart.component.html',
  styleUrls: ['./tokens-chart.component.scss'],
  providers: [DecimalPipe]
})
export class TokensChartComponent extends PeriodChangeComponent implements OnInit {
  isLoading = true;
  isFirstLoading = true;
  isLoadingTokensStatistics = true;
  tokensStatistics: TokensStatistics;
  tokenSymbol = TOKEN_SYMBOL;
  chartPeriod: ChartPeriod = ChartPeriod.LastWeek;
  chartPeriods: ChartPeriod[] = this.chartPeriodService.getChartPeriods();
  chartPeriodFromDate: Moment = moment.utc().add(-6, 'd');
  chartPeriodToDate: Moment = moment.utc();
  chartPeriodMaxDate: Moment = moment.utc();
  ChartPeriod = ChartPeriod;
  response: TokensListResponse;

  smallGraphicItems: SmallGraphicItem[] = [];
  dropdownData: any[] = [
    {label: 'Earned / Spent', value: 'EarnedSpent'},
    {label: 'Total Balance', value: 'TOTAL'}
  ];
  selectedChartType = 'EarnedSpent';
  // private
  private lineChartConfiguration: ChartjsLineChartConfiguration;
  private lineChart: Chart;
  private barChartConfiguration: Chart.ChartConfiguration;
  private barChart: Chart;

  @Output() totalTokensCount = new EventEmitter<number>();

  // #region translates
  @ViewChild('earnLabel')
  earnLabel: ElementRef<HTMLElement>;
  @ViewChild('burnLabel')
  burnLabel: ElementRef<HTMLElement>;

  @ViewChild('totalWalletBalanceLabelTooltipTemplate')
  totalWalletBalanceLabelTooltipTemplate: ElementRef<HTMLElement>;
  @ViewChild('totalTokensEarnedLabelTooltipTemplate')
  totalTokensEarnedLabelTooltipTemplate: ElementRef<HTMLElement>;
  @ViewChild('totalTokensSpentLabelTooltipTemplate')
  totalTokensSpentLabelTooltipTemplate: ElementRef<HTMLElement>;

  private translates = {
    earnLabel: '',
    burnLabel: ''
  };
  translatesForTemplate = {
    totalWalletBalanceLabelTooltip: '',
    totalTokensEarnedLabelTooltip: '',
    totalTokensSpentLabelTooltip: ''
  };
  // #endregion

  // tslint:disable-next-line: prettier
  constructor(
    private tokensStatisticsService: TokensStatisticsService,
    private chartPeriodService: ChartPeriodService,
    private decimalPipe: DecimalPipe,
    private chartjsUtilsService: ChartjsUtilsService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {
    super(chartPeriodService);
  }

  ngOnInit() {
    const tokenParameter = '{{tokenSymbol}}';
    // translates
    this.translates.earnLabel = this.earnLabel.nativeElement.innerText.replace(tokenParameter, TOKEN_SYMBOL);
    this.translates.burnLabel = this.burnLabel.nativeElement.innerText.replace(tokenParameter, TOKEN_SYMBOL);
    this.translatesForTemplate.totalWalletBalanceLabelTooltip = this.totalWalletBalanceLabelTooltipTemplate.nativeElement.innerText.replace(
      tokenParameter,
      TOKEN_SYMBOL
    );
    this.translatesForTemplate.totalTokensEarnedLabelTooltip = this.totalTokensEarnedLabelTooltipTemplate.nativeElement.innerText.replace(
      tokenParameter,
      TOKEN_SYMBOL
    );
    this.translatesForTemplate.totalTokensSpentLabelTooltip = this.totalTokensSpentLabelTooltipTemplate.nativeElement.innerText.replace(
      tokenParameter,
      TOKEN_SYMBOL
    );

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

    this.barChartConfiguration = Object.assign({} as Chart.ChartConfiguration, {
      type: 'bar',
      options: {
        legend: {
          display: false,
          labels: {
            fontSize: 14,
            padding: 20,
            usePointStyle: true
          },
          onClick: (e: MouseEvent) => e.stopPropagation(),
          position: 'top'
        },
        maintainAspectRatio: false,
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
              id: 'y-axis-earn',
              gridLines: {
                drawBorder: false,
                borderDash: [6, 4],
                color: '#d8dffd'
              },
              scaleLabel: {
                display: false,
                labelString: this.translates.earnLabel
              },
              ticks: {
                callback: (value: any) => {
                  return this.decimalPipe.transform(value);
                },
                min: 0,
                padding: 5
              },
              weight: 2
            },
            {
              id: 'y-axis-burn',
              gridLines: {
                drawBorder: false,
                borderDash: [6, 4],
                color: '#d8dffd'
              },
              position: 'right',
              scaleLabel: {
                display: false,
                labelString: this.translates.burnLabel
              },
              ticks: {
                callback: (value: any) => {
                  return this.decimalPipe.transform(value);
                },
                min: 0,
                padding: 5
              },
              weight: 1
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
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData) => {
              return this.chartjsUtilsService.applyNumberSeparatorsToTooltips(tooltipItem, data, this.decimalPipe);
            }
          },
          intersect: false,
          mode: 'nearest',
          xPadding: 10,
          yPadding: 10
        }
      },
      data: {
        labels: [],
        datasets: [
          {
            label: this.translates.earnLabel,
            type: 'bar',
            backgroundColor: '#1dc9b7',
            borderColor: '#1dc9b7',
            yAxisID: 'y-axis-earn',
            data: []
          },
          {
            label: this.translates.burnLabel,
            type: 'bar',
            backgroundColor: '#fd397a',
            borderColor: '#fd397a',
            yAxisID: 'y-axis-burn',
            data: []
          }
        ]
      }
    });

    super.ngOnInit();

    this.load();
    this.loadTotalTokensStatistics();
  }

  loadTotalTokensStatistics() {
    this.tokensStatisticsService.get().subscribe(
      response => {
        this.tokensStatistics = response;

        // #region handle tokens to units
        response.BurnedCount = RoundToAccuracy(response.BurnedCount);
        response.EarnedCount = RoundToAccuracy(response.EarnedCount);
        response.TotalCount = RoundToAccuracy(response.TotalCount);
        // #endregion

        this.smallGraphicItems = [
          {
            title: 'Tokens Earned',
            number: response.EarnedCount,
            // percentage: (response.EarnedCount / response.TotalCount) * 100,
            color: 'green',
            tooltip: this.translatesForTemplate.totalTokensEarnedLabelTooltip
          },
          {
            title: 'Tokens Spent',
            number: response.BurnedCount,
            // percentage: (response.BurnedCount / response.TotalCount) * 100,
            color: 'red',
            tooltip: this.translatesForTemplate.totalTokensSpentLabelTooltip
          }
        ];

        this.totalTokensCount.emit(this.tokensStatistics.TotalCount);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      },
      () => {
        this.isLoadingTokensStatistics = false;
      }
    );
  }

  load() {
    const request = {} as BasePeriodRequest;

    this.chartPeriodService.fillDates(this.chartPeriod, this.chartPeriodFromDate, this.chartPeriodToDate, request);

    this.isLoading = true;

    this.tokensStatisticsService.getChartStatistics(request).subscribe(
      (res: TokensListResponse) => {
        // #region handle tokens to units
        res.Burn.forEach(x => RoundToAccuracyPeriodTokensStatistics(x));

        res.Earn.forEach(x => RoundToAccuracyPeriodTokensStatistics(x));

        res.WalletBalance.forEach(x => RoundToAccuracyPeriodTokensStatistics(x));

        function RoundToAccuracyPeriodTokensStatistics(x: PeriodTokensStatistics) {
          x.Amount = RoundToAccuracy(x.Amount);
        }
        // #endregion

        this.response = res;
        this.loadChart();

        this.isLoading = false;
        this.isFirstLoading = false;
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

  loadChart() {
    if (this.selectedChartType === 'TOTAL') {
      this.updateLineChartData();
      this.drawLineChart();
    } else {
      this.updateChartsData();
      this.drawCharts();
    }
  }

  private updateChartsData() {
    this.updateBarChartData();
  }

  private updateBarChartData() {
    if (!this.response) {
      return;
    }

    const dataLabels: string[] = [];
    const earnDataSet = this.barChartConfiguration.data.datasets[0];
    const burnDataSet = this.barChartConfiguration.data.datasets[1];

    const updateData = (dataset: Chart.ChartDataSets, array: PeriodTokensStatistics[], labels?: string[]) => {
      const points: number[] = [];

      for (let i = 0, l = array.length; i < l; i++) {
        const item = array[i];
        const day = moment(item.Day).format(DAY_FORMAT);

        // put dates
        if (labels) {
          labels.push(day);
        }

        // put points
        points.push(item.Amount);
      }

      dataset.data = points;
    };

    updateData(earnDataSet, this.response.Earn, dataLabels);
    this.barChartConfiguration.data.labels = dataLabels;
    updateData(burnDataSet, this.response.Burn);
  }

  private drawCharts() {
    this.drawBarChart();
  }

  private drawBarChart() {
    if (!this.barChartConfiguration.data || !this.barChartConfiguration.data.datasets.length) {
      return;
    }

    if (this.barChart) {
      this.barChart.data = this.barChartConfiguration.data;
      this.barChart.update();
    } else {
      this.barChart = new Chart('tokens-chart', this.barChartConfiguration);
    }
  }

  private updateLineChartData() {
    if (!this.response) {
      return;
    }

    const data: ChartData = {};
    data.labels = [];
    data.datasets = [];

    const newDataSet: Chart.ChartDataSets = {
      backgroundColor: BRAND_SECOND_CHART_COLOR,
      borderColor: BRAND_COLOR,
      label: ''
    };

    const points: number[] = [];

    for (let i = 0, l = this.response.WalletBalance.length; i < l; i++) {
      const newData = this.response.WalletBalance[i];
      const day = moment(newData.Day).format(DAY_FORMAT);

      // put dates
      data.labels.push(day);

      // put points
      points.push(newData.Amount);
    }

    newDataSet.data = points;
    data.datasets.push(newDataSet);
    this.lineChartConfiguration.data = data;
  }

  private drawLineChart() {
    if (!this.lineChartConfiguration.data || !this.lineChartConfiguration.data.datasets.length) {
      return;
    }

    if (this.lineChart) {
      this.lineChart.data = this.lineChartConfiguration.data;
      this.lineChart.update();
    } else {
      this.lineChart = new Chart('tokens-total-chart', this.lineChartConfiguration);
    }
  }

  handleChartSelectType(newSelectedChartType: string) {
    this.selectedChartType = newSelectedChartType;
    this.load();
  }
}
