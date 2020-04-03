import {Component, Input, Optional} from '@angular/core';
import {AbstractControl, ControlContainer, FormGroupDirective} from '@angular/forms';

@Component({
  selector: 'app-form-control-error-message',
  templateUrl: './form-control-error-message.component.html',
  styleUrls: ['./form-control-error-message.component.scss']
})
export class FormControlErrorMessageComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('control')
  formControl: AbstractControl;

  // tslint:disable-next-line:no-input-rename
  @Input('controlName')
  set formControlName(controlName: string) {
    if (!this.controlContainer) {
      throw new Error('This component and the `controlName` option is intended to be used within a formGroup or formArray');
    }
    this.formControl = this.controlContainer.control.get(controlName);
    if (!this.formControl) {
      throw new Error('This component and the `controlName` option is intended to be used within a formGroup or formArray');
    }
  }

  get showErrors(): string | false {
    if (
      this.formControl &&
      this.formControl.invalid &&
      this.formControl.errors &&
      Object.keys(this.formControl.errors).length &&
      (this.formControl.touched || this.formControl.dirty || (this.formGroupDirective && this.formGroupDirective['submitted']))
    ) {
      return Object.keys(this.formControl.errors)[0];
    }
    return false;
  }

  constructor(@Optional() public controlContainer: ControlContainer, @Optional() public formGroupDirective: FormGroupDirective) {}
}
