import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CampaignsListPageComponent} from './campaigns-list-page/campaigns-list-page.component';
import {CampaignAddComponent} from './campaign-add/campaign-add.component';
import {CampaignEditComponent} from './campaign-edit/campaign-edit.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignsListPageComponent
  },
  {
    path: 'add-earn-action-rule',
    component: CampaignAddComponent
  },
  {
    path: 'edit-earn-action-rule/:id',
    component: CampaignEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule {}
