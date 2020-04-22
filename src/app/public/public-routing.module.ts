import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PublicLayoutComponent} from './public-layout/public-layout/public-layout.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {PublicLayoutModule} from './public-layout/public-layout.module';
import {EmailVerificationComponent} from './email-verification/email-verification.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'email-verification',
        component: EmailVerificationComponent,
      },
      {path: '**', component: NotFoundComponent},
    ],
  },
];

@NgModule({
  imports: [PublicLayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
