import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from 'src/app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SmartVoucherRoutingModule} from './smart-voucher-routing.module';
import {SmartVoucherListPageComponent} from './smart-voucher-list-page/smart-voucher-list-page.component';

@NgModule({
  declarations: [
    // components
    SmartVoucherListPageComponent // ,
    // SmartVoucherFormComponent,
    // SmartVoucherAddComponent,
    // SmartVoucherEditComponent
  ],
  imports: [
    // modules
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SmartVoucherRoutingModule
  ]
})
export class SmartVoucherModule {}
