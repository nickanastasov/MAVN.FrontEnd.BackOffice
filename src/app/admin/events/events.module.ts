import {EventsRoutingModule} from './events-routing.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SharedModule} from '../../shared/shared.module';
import {EventsListComponent} from './events-list/events-list.component';
import {DetailsDialogComponent} from './details-dialog/details-dialog.component';

@NgModule({
  declarations: [EventsListComponent, DetailsDialogComponent],
  imports: [CommonModule, EventsRoutingModule, SharedModule, FormsModule, ReactiveFormsModule],
  entryComponents: [DetailsDialogComponent]
})
export class EventsModule {}
