import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TiersListComponent} from './tiers-list/tiers-list.component';
import {TiersRoutingModule} from './tiers-routing.module';
import {FormsModule} from '@angular/forms';
import {SharedModule} from 'src/app/shared/shared.module';
import {TiersService} from './tiers.service';

@NgModule({
  declarations: [TiersListComponent],
  imports: [CommonModule, TiersRoutingModule, FormsModule, SharedModule],
  providers: [TiersService]
})
export class TiersModule {}
