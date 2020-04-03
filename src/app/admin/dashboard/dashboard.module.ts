import {NgModule} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';

import {DashboardRoutingModule} from './dashboard-routing.module';
// components
import {DashboardPageComponent} from './dashboard-page/dashboard-page.component';
import {LeadsChartComponent} from './leads-chart/leads-chart.component';
import {CustomersChartComponent} from './customers-chart/customers-chart.component';
import {SharedModule} from 'src/app/shared/shared.module';
// services
import {CustomersStatisticsService} from './services/customers-statistics.service';
import {TokensStatisticsService} from './services/tokens-statistics.service';
import {LeadsStatisticsService} from './services/leads-statistics.service';
import {FormsModule} from '@angular/forms';
import {ChartPeriodService} from './services/chart-period.service';
import {ChartjsUtilsService} from './services/chartjs-utils.service';
import {TokensChartComponent} from './tokens-chart/tokens-chart.component';
import {MatIconModule} from '@angular/material/icon';
import {SmallGraphicBoxesComponent} from './small-graphic-boxes/small-graphic-boxes.component';
import {ChartSelectComponent} from './chart-select/chart-select.component';
import {IntroPageComponent} from './intro-page/intro-page.component';

@NgModule({
  declarations: [
    // components
    DashboardPageComponent,
    IntroPageComponent,
    LeadsChartComponent,
    CustomersChartComponent,
    TokensChartComponent,
    SmallGraphicBoxesComponent,
    ChartSelectComponent
  ],
  imports: [
    // modules
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    MatIconModule
  ],
  providers: [
    // services
    ChartjsUtilsService,
    ChartPeriodService,
    CustomersStatisticsService,
    TokensStatisticsService,
    LeadsStatisticsService,
    DecimalPipe
  ]
})
export class DashboardModule {}
