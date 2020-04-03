import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PaymentGatewayListComponent} from './payment-gateway-list/payment-gateway-list.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentGatewayListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentGatewayRoutingModule {}
