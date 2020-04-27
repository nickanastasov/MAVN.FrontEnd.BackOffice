import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthenticationRoutingModule} from './authentication-routing.module';
import {PublicLayoutModule} from '../public/public-layout/public-layout.module';
import {LoginPageComponent} from './login-page/login-page.component';
import {SharedModule} from '../shared/shared.module';
import {ReactiveFormsModule} from '@angular/forms';
import {UserService} from '../admin/user/user.service';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    // modules
    CommonModule,
    AuthenticationRoutingModule,
    PublicLayoutModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [UserService],
})
export class AuthenticationModule {}
