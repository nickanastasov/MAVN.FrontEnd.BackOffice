import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from 'src/app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SmartVoucherRoutingModule} from './smart-voucher-routing.module';
import {SmartVoucherListPageComponent} from './smart-voucher-list-page/smart-voucher-list-page.component';
import {SmartVoucherAddComponent} from './smart-voucher-add/smart-voucher-add.component';
import {SmartVoucherFormComponent} from './smart-voucher-form/smart-voucher-form.component';
import {PartnersModule} from './../partners/partners.module';

@NgModule({
  declarations: [
    // components
    SmartVoucherListPageComponent,
    SmartVoucherFormComponent,
    SmartVoucherAddComponent
    // SmartVoucherEditComponent
  ],
  imports: [
    // modules
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SmartVoucherRoutingModule,
    PartnersModule
  ]
})
export class SmartVoucherModule {}
