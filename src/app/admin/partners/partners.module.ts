import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PartnersListComponent} from './partners-list/partners-list.component';
import {PartnerFormComponent} from './partner-form/partner-form.component';
import {PartnerEditComponent} from './partner-edit/partner-edit.component';
import {PartnerAddComponent} from './partner-add/partner-add.component';
import {PartnersRoutingModule} from './partners-routing.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PartnersByVerticalPipe} from './pipes/partner-by-vertical.pipe';
import {SearchPartnersPipe} from './pipes/search-partners.pipe';
import {TokenPipe} from 'src/app/shared/pipes/token.pipe';

@NgModule({
  declarations: [
    PartnersListComponent,
    PartnerFormComponent,
    PartnerEditComponent,
    PartnerAddComponent,
    // pipes
    PartnersByVerticalPipe,
    SearchPartnersPipe
  ],
  imports: [
    // modules
    CommonModule,
    PartnersRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    // pipes
    PartnersByVerticalPipe,
    SearchPartnersPipe,
    TokenPipe
  ]
})
export class PartnersModule {}
