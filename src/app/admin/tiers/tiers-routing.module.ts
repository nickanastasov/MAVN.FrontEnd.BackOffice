import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TiersListComponent} from './tiers-list/tiers-list.component';

const routes: Routes = [
  {
    path: '',
    component: TiersListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiersRoutingModule {}
