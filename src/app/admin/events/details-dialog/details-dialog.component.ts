import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EventParameters} from '../models/event-parameters.interface';

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.scss']
})
export class DetailsDialogComponent {
  constructor(public dialogRef: MatDialogRef<DetailsDialogComponent>, @Inject(MAT_DIALOG_DATA) public parameters: EventParameters[]) {}

  cancel(): void {
    this.dialogRef.close();
  }
}
