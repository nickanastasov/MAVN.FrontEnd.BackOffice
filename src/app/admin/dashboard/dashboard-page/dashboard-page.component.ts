import {Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, ElementRef} from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment';

import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {ChartPeriodService} from '../services/chart-period.service';
import {ChartPeriodInterface} from '../models/chart-period.interface';
import {ChartPeriod} from '../models/chart-period.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {CustomersCount} from '../customers-chart/models/customers-count.interface';
import {ChartjsDonutChartConfiguration} from '../models/chartjs/chartjs-donut-chart-configuration.class';
import {ChartData} from 'chart.js';
import * as Chart from 'chart.js';
import {TopPartner} from '../models/top-partner.interface';
import {StatisticsService} from 'src/app/shared/services/statistics.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  tokenSymbol = TOKEN_SYMBOL;

  totalNumbers: {[key: string]: number} = {
    Customers: 0,
    Tokens: 0,
    Leads: 0,
  };

  // #region new charts
  isFirstLoading = true;
  totalNewCustomers: number;
  totalVouchers: string | number;
  isLoadingTotalVouchers = true;
  totalActiveCustomers: number;
  totalActiveCustomersPercentage: number;
  repeatedCustomers: number;
  repeatedCustomersPercentage: number;
  private activeCustomersDonutChartConfiguration: ChartjsDonutChartConfiguration;
  private activeCustomersDonutChart: Chart;
  private repeatedCustomersDonutChartConfiguration: ChartjsDonutChartConfiguration;
  private repeatedCustomersDonutChart: Chart;
  // #endregion

  // #region Top 5 ratings
  topEarnPartnerValue = 2500;
  topEarnPartners: TopPartner[] = [
    {
      Name: 'Mall of Arabia',
      Value: this.topEarnPartnerValue,
    },
    {
      Name: 'Ritz-Carlton',
      Value: 2150,
    },
    {
      Name: 'SAUDIA',
      Value: 1789,
    },
    {
      Name: 'Darraq Apartments',
      Value: 1567,
    },
    {
      Name: 'Hertz Car Rental',
      Value: 1320,
    },
  ];

  topSpendPartnerValue = 3700;
  topSpendPartners: TopPartner[] = [
    {
      Name: 'Ritz-Carlton',
      Value: this.topSpendPartnerValue,
    },
    {
      Name: 'Mall of Arabia',
      Value: 2650,
    },
    {
      Name: 'SAUDIA',
      Value: 1462,
    },
    {
      Name: 'Air Taxi',
      Value: 1340,
    },
    {
      Name: 'Hertz Car Rental',
      Value: 1238,
    },
  ];
  // //#endregion

  filtersList: ChartPeriodInterface[] = [];

  currentFilter: ChartPeriod = ChartPeriod.LastWeek;

  chartPeriodFromDate: Moment = moment.utc().add(-6, 'd');
  chartPeriodToDate: Moment = moment.utc();
  chartPeriodMinDate: Moment = moment.utc();
  chartPeriodMaxDate: Moment = moment.utc();

  @ViewChild('headerTitle', {static: true})
  headerTitle: ElementRef<HTMLElement>;
  @ViewChild('chartPeriodWeek', {static: true})
  chartPeriodWeek: ElementRef<HTMLElement>;
  @ViewChild('chartPeriodWeeks', {static: true})
  chartPeriodWeeks: ElementRef<HTMLElement>;
  @ViewChild('chartPeriodMonth', {static: true})
  chartPeriodMonth: ElementRef<HTMLElement>;
  @ViewChild('chartPeriodSemester', {static: true})
  chartPeriodSemester: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: '',
    chartPeriodWeek: '',
    chartPeriodWeeks: '',
    chartPeriodMonth: '',
    chartPeriodSemester: '',
  };

  constructor(
    // services
    private chartPeriodService: ChartPeriodService,
    private headerMenuService: HeaderMenuService,
    private statisticService: StatisticsService
  ) {}
  ngOnInit() {
    this.filtersList = this.chartPeriodService.getChartPeriodsWithNames();
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;
    this.translates.chartPeriodWeek = this.chartPeriodWeek.nativeElement.innerText;
    this.translates.chartPeriodWeeks = this.chartPeriodWeeks.nativeElement.innerText;
    this.translates.chartPeriodMonth = this.chartPeriodMonth.nativeElement.innerText;
    this.translates.chartPeriodSemester = this.chartPeriodSemester.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate,
    };

    this.activeCustomersDonutChartConfiguration = Object.assign(new ChartjsDonutChartConfiguration(), {
      options: {
        cutoutPercentage: 70,
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        tooltips: {
          enabled: false,
        },
      },
    });

    this.repeatedCustomersDonutChartConfiguration = Object.assign(
      new ChartjsDonutChartConfiguration(),
      this.activeCustomersDonutChartConfiguration
    );

    this.statisticService.getTotalVoucherCampaignsSupply().subscribe((response) => {
      this.totalVouchers = response.ActiveCampaignsVouchersTotalCount;
      this.isLoadingTotalVouchers = false;
    });
  }

  handleTotalCustomersCount(value: CustomersCount) {
    this.totalNumbers['Customers'] = value.TotalCustomers;
    this.totalNewCustomers = value.TotalNewCustomers;

    if (!this.isFirstLoading) {
      return;
    }

    this.totalActiveCustomers = value.TotalActiveCustomers;
    this.totalActiveCustomersPercentage = Math.round((value.TotalActiveCustomers / value.TotalCustomers) * 100);

    // let repeated will be part of active
    this.repeatedCustomers = Math.round(value.TotalActiveCustomers * 0.25);
    this.repeatedCustomersPercentage = Math.round((this.repeatedCustomers / value.TotalCustomers) * 100);

    // create charts
    const secondColor = '#e1e1ef';
    const activeCustomersChartData: ChartData = {};
    const repeatedCustomersChartData: ChartData = {};

    activeCustomersChartData.datasets = [
      {
        data: [this.totalActiveCustomersPercentage, 100 - this.totalActiveCustomersPercentage],
        backgroundColor: ['#2B61D4', secondColor],
      },
    ];

    repeatedCustomersChartData.datasets = [
      {
        data: [this.repeatedCustomersPercentage, 100 - this.repeatedCustomersPercentage],
        backgroundColor: ['#3EC1D0', secondColor],
      },
    ];

    this.activeCustomersDonutChartConfiguration.data = activeCustomersChartData;
    this.repeatedCustomersDonutChartConfiguration.data = repeatedCustomersChartData;

    if (!this.activeCustomersDonutChart) {
      this.activeCustomersDonutChart = new Chart('active-customers-donut-chart', this.activeCustomersDonutChartConfiguration);
    }

    if (!this.repeatedCustomersDonutChart) {
      this.repeatedCustomersDonutChart = new Chart('repeated-customers-donut-chart', this.repeatedCustomersDonutChartConfiguration);
    }

    this.isFirstLoading = false;
  }

  handleTitleNumbers(value: number, category: string) {
    this.totalNumbers[category] = value;
  }

  handleFilterClick(event: Event, filterItem: {name: string; value: ChartPeriod}) {
    event.preventDefault();

    this.currentFilter = filterItem.value;
    this.chartPeriodService.chartPeriod = filterItem.value;
  }
  handleClearFilter(event: Event) {
    event.preventDefault();

    this.currentFilter = ChartPeriod.LastWeek;
    this.chartPeriodFromDate = moment.utc().add(-6, 'd');
    this.chartPeriodToDate = moment.utc();

    this.chartPeriodService.chartPeriod = this.currentFilter;
  }

  handleChartPeriodRangeChange(value: Moment, chartPeriodRange: string) {
    if (chartPeriodRange === 'fromDate') {
      this.chartPeriodFromDate = value;
      this.chartPeriodMinDate = value.clone().add(1, 'd');
    } else if (chartPeriodRange === 'toDate') {
      this.chartPeriodToDate = value;
    }
  }

  applyCustomChartPeriod() {
    this.chartPeriodService.customChartPeriod = {
      from: this.chartPeriodFromDate,
      to: this.chartPeriodToDate,
    };
  }
}
