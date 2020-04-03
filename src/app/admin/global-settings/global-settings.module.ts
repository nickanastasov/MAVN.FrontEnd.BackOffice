import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from 'src/app/shared/shared.module';
import {GlobalSettingsService} from './services/global-settings.service';
import {GlobalSettingsRoutingModule} from './global-settings-routing.module';
import {GlobalSettingsPageComponent} from './global-settings-page/global-settings-page.component';
import {MyProfilePageComponent} from './my-profile-page/my-profile-page.component';

@NgModule({
  declarations: [GlobalSettingsPageComponent, MyProfilePageComponent],
  imports: [
    // modules
    CommonModule,
    FormsModule,
    GlobalSettingsRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [GlobalSettingsService]
})
export class GlobalSettingsModule {}
