import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from 'src/app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SpendActionRuleAddComponent} from './spend-action-rule-add/spend-action-rule-add.component';
import {SpendActionRuleRoutingModule} from './spend-action-rule-routing.module';
import {SpendActionRuleFormComponent} from './spend-action-rule-form/spend-action-rule-form.component';
import {SpendActionRuleListPageComponent} from './spend-action-rule-list-page/spend-action-rule-list-page.component';
import {SpendActionRuleEditComponent} from './spend-action-rule-edit/spend-action-rule-edit.component';
import {PartnersModule} from '../partners/partners.module';

@NgModule({
  declarations: [
    // components
    SpendActionRuleListPageComponent,
    SpendActionRuleFormComponent,
    SpendActionRuleAddComponent,
    SpendActionRuleEditComponent
  ],
  imports: [
    // modules
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SpendActionRuleRoutingModule,
    PartnersModule
  ]
})
export class SpendActionRuleModule {}
