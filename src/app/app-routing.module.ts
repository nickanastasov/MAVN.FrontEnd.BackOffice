import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ApiAuthGuardService} from 'ngx-api-utils';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [ApiAuthGuardService],
    canActivateChild: [ApiAuthGuardService]
  },
  {
    path: 'authentication',
    loadChildren: './authentication/authentication.module#AuthenticationModule',
    canActivate: [ApiAuthGuardService],
    canActivateChild: [ApiAuthGuardService]
  },
  {
    path: '',
    loadChildren: './public/public.module#PublicModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
