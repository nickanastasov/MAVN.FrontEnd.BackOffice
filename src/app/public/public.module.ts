import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PublicRoutingModule} from './public-routing.module';
import {SharedModule} from '../shared/shared.module';
// Components
import {NotFoundComponent} from './not-found/not-found.component';
import {EmailVerificationComponent} from './email-verification/email-verification.component';

@NgModule({
  // tslint:disable-next-line:prettier
  declarations: [NotFoundComponent, EmailVerificationComponent],
  // tslint:disable-next-line:prettier
  imports: [CommonModule, PublicRoutingModule, SharedModule],
})
export class PublicModule {}
