import {CustomersService} from './customers.service';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CustomersRoutingModule} from './customers-routing.module';
import {CustomersListPageComponent} from './customers-list-page/customers-list-page.component';
import {SharedModule} from 'src/app/shared/shared.module';
import {CustomerDetailsPageComponent} from './customer-details-page/customer-details-page.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [CustomersListPageComponent, CustomerDetailsPageComponent],
  imports: [CommonModule, CustomersRoutingModule, FormsModule, SharedModule],
  providers: [CustomersService]
})
export class CustomersModule {}
