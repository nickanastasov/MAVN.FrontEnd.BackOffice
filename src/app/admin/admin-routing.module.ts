import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminLayoutComponent} from './admin-layout/admin-layout/admin-layout.component';
import {AdminLayoutModule} from './admin-layout/admin-layout.module';
import {ROUTE_SPEND_RULES, ROUTE_SMART_VOUCHERS} from '../core/constants/routes';

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
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'customers',
        loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
      },
      {
        path: 'earn-action-rules',
        loadChildren: () => import('./campaign/campaign.module').then(m => m.CampaignModule)
      },
      {
        path: ROUTE_SPEND_RULES,
        loadChildren: () => import('./spend-action-rule/spend-action-rule.module').then(m => m.SpendActionRuleModule)
      },
      {
        path: ROUTE_SMART_VOUCHERS,
        loadChildren: () => import('./smart-voucher/smart-voucher.module').then(m => m.SmartVoucherModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./events/events.module').then(m => m.EventsModule)
      },
      {
        path: 'partners',
        loadChildren: () => import('./partners/partners.module').then(m => m.PartnersModule)
      },
      {
        path: 'global-settings',
        loadChildren: () => import('./global-settings/global-settings.module').then(m => m.GlobalSettingsModule)
      },
      {
        path: 'tiers',
        loadChildren: () => import('./tiers/tiers.module').then(m => m.TiersModule)
      }
    ]
  }
];

@NgModule({
  imports: [AdminLayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
