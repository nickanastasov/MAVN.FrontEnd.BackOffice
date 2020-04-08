import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SmartVoucherListPageComponent} from './smart-voucher-list-page/smart-voucher-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: SmartVoucherListPageComponent
  } // ,
  // {
  //   path: 'add-smart-voucher',
  //   component: SmartVoucherAddComponent
  // },
  // {
  //   path: `edit-smart-voucher/:id`,
  //   component: SmartVoucherEditComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartVoucherRoutingModule {}
