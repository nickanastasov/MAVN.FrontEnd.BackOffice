import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GlobalSettingsPageComponent} from './global-settings-page/global-settings-page.component';
import {MyProfilePageComponent} from './my-profile-page/my-profile-page.component';
import {InaccessibleRouteGuard} from '../../shared/guards/inaccessible-route.guard';

const routes: Routes = [
  {
    path: 'system-settings',
    component: GlobalSettingsPageComponent,
    canActivate: [InaccessibleRouteGuard],
  },
  {
    path: 'my-profile',
    component: MyProfilePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GlobalSettingsRoutingModule {}
