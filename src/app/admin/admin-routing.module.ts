import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminLayoutComponent} from './admin-layout/admin-layout/admin-layout.component';
import {AdminLayoutModule} from './admin-layout/admin-layout.module';
import {ROUTE_SPEND_RULES} from '../core/constants/routes';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'platform/dashboard'
  },
  {
    path: 'platform',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'customers',
        loadChildren: './customers/customers.module#CustomersModule'
      },
      {
        path: 'earn-action-rules',
        loadChildren: './campaign/campaign.module#CampaignModule'
      },
      {
        path: ROUTE_SPEND_RULES,
        loadChildren: './spend-action-rule/spend-action-rule.module#SpendActionRuleModule'
      },
      {
        path: 'users',
        loadChildren: './user/user.module#UserModule'
      },
      {
        path: 'transactions',
        loadChildren: './transactions/transactions.module#TransactionsModule'
      },
      {
        path: 'events',
        loadChildren: './events/events.module#EventsModule'
      },
      {
        path: 'partners',
        loadChildren: './partners/partners.module#PartnersModule'
      },
      {
        path: 'global-settings',
        loadChildren: './global-settings/global-settings.module#GlobalSettingsModule'
      },
      {
        path: 'tiers',
        loadChildren: './tiers/tiers.module#TiersModule'
      }
    ]
  }
];

@NgModule({
  imports: [AdminLayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
