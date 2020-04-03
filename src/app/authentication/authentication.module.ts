import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthenticationRoutingModule} from './authentication-routing.module';
import {PublicLayoutModule} from '../public/public-layout/public-layout.module';
import {LoginPageComponent} from './login-page/login-page.component';
import {SharedModule} from '../shared/shared.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [CommonModule, AuthenticationRoutingModule, PublicLayoutModule, SharedModule, ReactiveFormsModule]
})
export class AuthenticationModule {}
