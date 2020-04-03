import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PartnersListComponent} from './partners-list/partners-list.component';
import {PartnerEditComponent} from './partner-edit/partner-edit.component';
import {PartnerAddComponent} from './partner-add/partner-add.component';

const routes: Routes = [
  {
    path: '',
    component: PartnersListComponent
  },
  {
    path: 'add-partner',
    component: PartnerAddComponent
  },
  {
    path: 'edit-partner/:id',
    component: PartnerEditComponent
  }
];

@NgModule({
  imports: [[RouterModule.forChild(routes)]],
  exports: [RouterModule]
})
export class PartnersRoutingModule {}
