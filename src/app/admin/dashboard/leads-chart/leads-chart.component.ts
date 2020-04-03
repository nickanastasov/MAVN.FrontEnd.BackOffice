import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ChartPeriod} from '../models/chart-period.enum';
import {LeadsStatisticsService} from '../services/leads-statistics.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {LeadsListRequest} from './models/leads-list-request.interface';
import {LeadsListResponse} from './models/leads-list-response.interface';
import {LeadState} from './models/lead-state.enum';
import * as moment from 'moment';
import {Moment} from 'moment';
import {DAY_FORMAT} from '../models/chart-constants';
import {ChartPeriodService} from '../services/chart-period.service';
import * as Chart from 'chart.js';
import {PeriodChangeComponent} from '../models/period-change-component';
import {SmallGraphicItem} from '../small-graphic-boxes/small-graphic-item.interface';
import {ChartjsLineChartConfiguration} from '../models/chartjs/chartjs-line-chart-configuration.class';
import {ChartjsUtilsService} from '../services/chartjs-utils.service';
import {ChartData} from 'chart.js';
import {DecimalPipe} from '@angular/common';
import {BRAND_SECOND_CHART_COLOR, BRAND_COLOR} from 'src/app/core/constants/const';

@Component({
  selector: 'app-leads-chart',
  templateUrl: './leads-chart.component.html',
  styleUrls: ['./leads-chart.component.scss']
})
export class LeadsChartComponent extends PeriodChangeComponent implements OnInit {
  isLoading = true;
  isFirstLoading = true;
  chartCheckboxes = {
    [LeadState.Pending]: true,
    [LeadState.Confirmed]: true,
    [LeadState.Approved]: true
  };
  disabledChartCheckboxes = {
    [LeadState.Pending]: false,
    [LeadState.Confirmed]: false,
    [LeadState.Approved]: false
  };
  LeadState = LeadState;
  chartPeriod: ChartPeriod = ChartPeriod.LastWeek;
  chartPeriods: ChartPeriod[] = this.chartPeriodService.getChartPeriods();
  chartPeriodFromDate: Moment = moment.utc().add(-6, 'd');
  chartPeriodToDate: Moment = moment.utc();
  chartPeriodMaxDate: Moment = moment.utc();
  ChartPeriod = ChartPeriod;
  smallGraphicItems: SmallGraphicItem[] = [];
  dropdownData: any[] = [
    {label: 'Leads', value: 'TOTAL'},
    {label: 'Pending / Confirmed', value: 'Pending/Confirmed'}
  ];
  selectedChartType = 'TOTAL';
  // private
  private lineChartConfiguration: ChartjsLineChartConfiguration;
  private lineChart: Chart;
  private barChartConfiguration: Chart.ChartConfiguration;
  private barChart: Chart;
  private response: LeadsListResponse;
  private chartColors = {
    [LeadState.Pending]: '#6e4ff5',
    [LeadState.Confirmed]: '#f6aa33',
    [LeadState.Approved]: '#2abe81'
  };
  private barChartDataSets = {
    [LeadState.Pending]: {
      label: LeadState.Pending,
      backgroundColor: this.chartColors[LeadState.Pending],
      borderWidth: 0,
      data: [] as number[]
    },
    [LeadState.Confirmed]: {
      label: LeadState.Confirmed,
      backgroundColor: this.chartColors[LeadState.Confirmed],
      borderWidth: 0,
      data: [] as number[]
    },
    [LeadState.Approved]: {
      label: LeadState.Approved,
      backgroundColor: this.chartColors[LeadState.Approved],
      borderWidth: 0,
      data: [] as number[]
    }
  };

  @Output() totalLeadsCount = new EventEmitter<number>();

  // #region translates
  @ViewChild('leadsPendingLabelTooltipTemplate')
  leadsPendingLabelTooltipTemplate: ElementRef<HTMLElement>;
  @ViewChild('leadsConfirmedLabelTooltipTemplate')
  leadsConfirmedLabelTooltipTemplate: ElementRef<HTMLElement>;
  @ViewChild('leadsApprovedLabelTooltipTemplate')
  leadsApprovedLabelTooltipTemplate: ElementRef<HTMLElement>;

  translatesForTemplate = {
    leadsPendingLabelTooltip: '',
    leadsConfirmedLabelTooltip: '',
    leadsApprovedLabelTooltip: ''
  };
  // #endregion

  constructor(
    // services
    private leadsStatisticsService: LeadsStatisticsService,
    private decimalPipe: DecimalPipe,
    private chartPeriodService: ChartPeriodService,
    private chartjsUtilsService: ChartjsUtilsService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {
    super(chartPeriodService);
  }

  ngOnInit() {
    this.translatesForTemplate.leadsPendingLabelTooltip = this.leadsPendingLabelTooltipTemplate.nativeElement.innerText;
    this.translatesForTemplate.leadsConfirmedLabelTooltip = this.leadsConfirmedLabelTooltipTemplate.nativeElement.innerText;
    this.translatesForTemplate.leadsApprovedLabelTooltip = this.leadsApprovedLabelTooltipTemplate.nativeElement.innerText;

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
            boxWidth: 12,
            fontSize: 12,
            padding: 20
          },
          onClick: (e: MouseEvent) => e.stopPropagation(),
          position: 'right'
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              // stacked: true
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
              // stacked: true,
              ticks: {
                min: 0,
                padding: 5,
                precision: 0
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
        },
        tooltips: {
          borderWidth: 0,
          intersect: false,
          mode: 'point',
          position: 'nearest',
          xPadding: 10,
          yPadding: 10
        }
      },
      data: {
        labels: [],
        datasets: []
      }
    });

    super.ngOnInit();

    this.load();
  }

  load() {
    const request = {} as LeadsListRequest;

    this.chartPeriodService.fillDates(this.chartPeriod, this.chartPeriodFromDate, this.chartPeriodToDate, request);

    this.isLoading = true;

    this.leadsStatisticsService.getChartStatistics(request).subscribe(
      (res: LeadsListResponse) => {
        this.response = res;
        this.loadChart();

        this.isLoading = false;
        this.isFirstLoading = false;

        const calculatedResponseData = {
          pending: res.Leads[res.Leads.length - 1].Value[0].Count,
          confirmed: res.Leads[res.Leads.length - 1].Value[1].Count,
          approved: res.Leads[res.Leads.length - 1].Value[2].Count
        };

        this.smallGraphicItems = [
          {
            title: 'Pending',
            number: calculatedResponseData.pending,
            percentage: (calculatedResponseData.pending / res.TotalNumber) * 100,
            color: 'blue',
            tooltip: this.translatesForTemplate.leadsPendingLabelTooltip
          },
          {
            title: 'Confirmed',
            number: calculatedResponseData.confirmed,
            percentage: (calculatedResponseData.confirmed / res.TotalNumber) * 100,
            color: 'orange',
            tooltip: this.translatesForTemplate.leadsConfirmedLabelTooltip
          },
          {
            title: 'Approved',
            number: calculatedResponseData.approved,
            percentage: (calculatedResponseData.approved / res.TotalNumber) * 100,
            color: 'green',
            tooltip: this.translatesForTemplate.leadsApprovedLabelTooltip
          }
        ];
        this.totalLeadsCount.emit(this.response.TotalNumber);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isLoading = false;
      }
    );
  }

  loadChart() {
    if (this.selectedChartType === 'TOTAL') {
      this.updateLineChartData();
      this.drawLineChart();
    } else {
      this.updateChartData();
      this.drawChart();
    }
  }

  chartCheckboxChanged() {
    this.disabledChartCheckboxes[LeadState.Pending] = this.isUncheckedOthers(LeadState.Pending);
    this.disabledChartCheckboxes[LeadState.Confirmed] = this.isUncheckedOthers(LeadState.Confirmed);
    this.disabledChartCheckboxes[LeadState.Approved] = this.isUncheckedOthers(LeadState.Approved);

    this.updateChartData();
    this.drawChart();
  }

  chartPeriodChanged() {
    if (this.chartPeriod !== ChartPeriod.Custom) {
      this.load();
    }
  }

  applyCustomChartPeriod() {
    this.load();
  }

  private isUncheckedOthers(excludeKey: string) {
    for (const key in this.chartCheckboxes) {
      if (key === excludeKey) {
        continue;
      }

      if (this.chartCheckboxes.hasOwnProperty(key)) {
        const value = this.chartCheckboxes[key as LeadState];

        if (value) {
          return false;
        }
      }
    }

    return true;
  }

  private updateChartData() {
    if (!this.response) {
      return;
    }

    // #region chartjs approach

    this.barChartConfiguration.data.labels = [];
    this.barChartConfiguration.data.datasets = [];

    if (this.chartCheckboxes[LeadState.Pending]) {
      this.barChartDataSets[LeadState.Pending].data = [];
      this.barChartConfiguration.data.datasets.push(this.barChartDataSets[LeadState.Pending]);
    }

    if (this.chartCheckboxes[LeadState.Confirmed]) {
      this.barChartDataSets[LeadState.Confirmed].data = [];
      this.barChartConfiguration.data.datasets.push(this.barChartDataSets[LeadState.Confirmed]);
    }

    if (this.chartCheckboxes[LeadState.Approved]) {
      this.barChartDataSets[LeadState.Approved].data = [];
      this.barChartConfiguration.data.datasets.push(this.barChartDataSets[LeadState.Approved]);
    }

    for (let i = 0, l = this.response.Leads.length; i < l; i++) {
      const lead = this.response.Leads[i];
      const day = moment(lead.Day).format(DAY_FORMAT);

      // put dates
      this.barChartConfiguration.data.labels.push(day);

      // put points
      if (this.chartCheckboxes[LeadState.Pending]) {
        this.barChartDataSets[LeadState.Pending].data.push(lead.Value[0].Count);
      }

      if (this.chartCheckboxes[LeadState.Confirmed]) {
        this.barChartDataSets[LeadState.Confirmed].data.push(lead.Value[1].Count);
      }

      if (this.chartCheckboxes[LeadState.Approved]) {
        this.barChartDataSets[LeadState.Approved].data.push(lead.Value[2].Count);
      }
    }

    // #endregion
  }

  private drawChart() {
    // #region chartjs approach

    if (!this.barChartConfiguration.data || !this.barChartConfiguration.data.datasets.length) {
      return;
    }

    if (this.barChart) {
      this.barChart.data = this.barChartConfiguration.data;
      this.barChart.update();
    } else {
      this.barChart = new Chart('leads-chart', this.barChartConfiguration);
    }

    // #endregion
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

    for (let i = 0, l = this.response.Leads.length; i < l; i++) {
      const newData = this.response.Leads[i];
      const day = moment(newData.Day).format(DAY_FORMAT);

      // put dates
      data.labels.push(day);

      // put points
      points.push(newData.Total);
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
      this.lineChart = new Chart('leads-total-chart', this.lineChartConfiguration);
    }
  }

  handleChartSelectType(newSelectedChartType: string) {
    this.selectedChartType = newSelectedChartType;
    this.load();
  }
}
