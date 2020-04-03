import {CommonModule} from '@angular/common';
import {SharedModule} from 'src/app/shared/shared.module';
import {NgModule} from '@angular/core';
import {PaymentGatewayListComponent} from './payment-gateway-list/payment-gateway-list.component';
import {PaymentGatewayRoutingModule} from './payment-gateway-routing.module';

@NgModule({
  declarations: [PaymentGatewayListComponent],
  imports: [CommonModule, SharedModule, PaymentGatewayRoutingModule]
})
export class PaymentGatewayModule {}
