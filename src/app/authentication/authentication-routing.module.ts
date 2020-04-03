import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PublicLayoutComponent} from '../public/public-layout/public-layout/public-layout.component';
import {LoginPageComponent} from './login-page/login-page.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        component: LoginPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
