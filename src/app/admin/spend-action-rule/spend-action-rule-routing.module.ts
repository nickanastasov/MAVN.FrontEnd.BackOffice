import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SpendActionRuleAddComponent} from './spend-action-rule-add/spend-action-rule-add.component';
import {SpendActionRuleListPageComponent} from './spend-action-rule-list-page/spend-action-rule-list-page.component';
import {SpendActionRuleEditComponent} from './spend-action-rule-edit/spend-action-rule-edit.component';
import {ROUTE_EDIT_SPEND_RULE} from 'src/app/core/constants/routes';

const routes: Routes = [
  {
    path: '',
    component: SpendActionRuleListPageComponent
  },
  {
    path: 'add-spend-action-rule',
    component: SpendActionRuleAddComponent
  },
  {
    path: `${ROUTE_EDIT_SPEND_RULE}/:id`,
    component: SpendActionRuleEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpendActionRuleRoutingModule {}
