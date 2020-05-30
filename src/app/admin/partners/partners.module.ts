import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PartnersListComponent} from './partners-list/partners-list.component';
import {PartnerFormComponent} from './partner-form/partner-form.component';
import {PartnerEditComponent} from './partner-edit/partner-edit.component';
import {PartnerAddComponent} from './partner-add/partner-add.component';
import {PartnersRoutingModule} from './partners-routing.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {QRCodeModule} from 'angularx-qrcode';

@NgModule({
  declarations: [
    // components
    PartnersListComponent,
    PartnerFormComponent,
    PartnerEditComponent,
    PartnerAddComponent,
  ],
  imports: [
    // modules
    CommonModule,
    PartnersRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
  ],
})
export class PartnersModule {}
