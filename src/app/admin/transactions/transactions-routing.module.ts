import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TransactionsListComponent} from './transactions-list/transactions-list.component';

const routes: Routes = [
  {
    path: '',
    component: TransactionsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule {}
