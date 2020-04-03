import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CustomersListPageComponent} from './customers-list-page/customers-list-page.component';
import {CustomerDetailsPageComponent} from './customer-details-page/customer-details-page.component';

const routes: Routes = [
  {
    path: '',
    component: CustomersListPageComponent
  },
  {
    path: 'details/:id',
    component: CustomerDetailsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule {}
