import {Component, Input, Optional, TemplateRef} from '@angular/core';
import {AbstractControl, ControlContainer, FormGroupDirective} from '@angular/forms';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html'
})
export class ErrorMessageComponent {
  @Input()
  key: string;

  @Input()
  message: string;

  @Input() template: TemplateRef<any>;
  @Input() templateContext: any;

  @Input() showByDefault: boolean = false;

  @Input('controlName')
  set formControlName(controlName: string) {
    this.formControl = this.controlContainer.control.get(controlName);
    if (!this.formControl) {
      throw new Error('This component and the associated control should be used within a formGroup');
    }
  }

  constructor(@Optional() public controlContainer: ControlContainer, @Optional() public formGroupDirective: FormGroupDirective) {}

  formControl: AbstractControl;

  error: string;

  get showError(): boolean {
    if (this.formControl && this.formControl.invalid && this.formControl.errors && Object.keys(this.formControl.errors).length) {
      if (this.formControl.touched || this.formControl.dirty || (this.formGroupDirective && this.formGroupDirective['submitted'])) {
        this.error = Object.keys(this.formControl.errors)[0];
        return !this.key || this.error === this.key;
      }
    }
    return false;
  }
}
