import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardPageComponent} from './dashboard-page/dashboard-page.component';
import {IntroPageComponent} from './intro-page/intro-page.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent
  },
  {
    path: 'intro',
    component: IntroPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
