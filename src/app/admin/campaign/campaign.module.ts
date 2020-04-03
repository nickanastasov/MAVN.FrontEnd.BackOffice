import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CampaignRoutingModule} from './campaign-routing.module';
import {CampaignFormComponent} from './campaign-form/campaign-form.component';
import {CampaignsListPageComponent} from './campaigns-list-page/campaigns-list-page.component';
import {SharedModule} from '../../shared/shared.module';
import {CampaignAddComponent} from './campaign-add/campaign-add.component';
import {CampaignEditComponent} from './campaign-edit/campaign-edit.component';
import {PartnersModule} from '../partners/partners.module';
import {CampaignFormConditionsComponent} from './campaign-form/partials/campaign-form-conditions/campaign-form-conditions.component';
import {CampaignFromOptionalConditionsComponent} from './campaign-form/partials/campaign-form-optional-conditions/campaign-form-optional-conditions.component';
import {CampaignFormStakingComponent} from './campaign-form/partials/campaign-form-staking/campaign-form-staking.component';
import {CampaignFormRewardComponent} from './campaign-form/partials/campaign-form-reward/campaign-form-reward.component';
import {CampaignFromMobileContentComponent as CampaignFormMobileContentComponent} from './campaign-form/partials/campaign-form-mobile-content/campaign-form-mobile-content.component';

@NgModule({
  declarations: [
    // components
    CampaignFormComponent,
    CampaignFormConditionsComponent,
    CampaignFromOptionalConditionsComponent,
    CampaignFormStakingComponent,
    CampaignFormRewardComponent,
    CampaignFormMobileContentComponent,
    CampaignsListPageComponent,
    CampaignAddComponent,
    CampaignEditComponent
  ],
  imports: [
    // modules
    CommonModule,
    CampaignRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PartnersModule
  ]
})
export class CampaignModule {}
