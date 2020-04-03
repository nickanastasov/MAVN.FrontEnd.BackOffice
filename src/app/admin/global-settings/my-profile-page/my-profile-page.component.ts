import {Component, OnInit, ElementRef, ViewChild, OnDestroy, TemplateRef} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {PasswordEqualledValidator, PasswordValidator, LengthValidator} from 'src/app/shared/utils/validators';
import {PasswordValidationRules} from 'src/app/shared/models/password-validation.interface';
import {markFormControlAsTouched} from 'src/app/shared/utils/markFormControlAsTouched';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {Subscription} from 'rxjs';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-my-profile-page',
  templateUrl: './my-profile-page.component.html',
  styleUrls: ['./my-profile-page.component.scss']
})
export class MyProfilePageComponent implements OnInit, OnDestroy {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isSavingChangePassword = false;
  changePasswordFormProps = {
    CurrentPassword: 'CurrentPassword',
    Password: 'Password',
    RepeatPassword: 'RepeatPassword'
  };
  rules: PasswordValidationRules;
  invalidPasswordRules: any = {};
  passwordMeterText: string = '';
  changePasswordForm: FormGroup;
  isInitialized = false;

  private changePasswordFieldSubscription: Subscription;
  private changePasswordFormSubscription: Subscription;

  // #region translates
  @ViewChild('passwordSuccessfullyMessage')
  passwordSuccessfullyMessage: ElementRef<HTMLElement>;
  @ViewChild('currentPasswordInvalidMessage')
  currentPasswordInvalidMessage: ElementRef<HTMLElement>;
  private translates = {
    passwordSuccessfullyMessage: '',
    currentPasswordInvalidMessage: ''
  };

  templates: GlobalTemplates;
  // #endregion

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {
    this.templates = this.translateService.templates;

    if (this.settingsService.PasswordValidationRules) {
      this.rules = this.settingsService.PasswordValidationRules;

      this.changePasswordForm = this.fb.group(
        {
          [this.changePasswordFormProps.CurrentPassword]: [
            null,
            [
              // validators
              Validators.required,
              LengthValidator(this.rules.MinLength, this.rules.MaxLength),
              PasswordValidator(this.rules)
            ]
          ],
          [this.changePasswordFormProps.Password]: [
            null,
            [
              // validators
              Validators.required,
              LengthValidator(this.rules.MinLength, this.rules.MaxLength),
              PasswordValidator(this.rules)
            ]
          ],
          [this.changePasswordFormProps.RepeatPassword]: [
            null,
            [
              // Validators
              Validators.required,
              LengthValidator(this.rules.MinLength, this.rules.MaxLength),
              PasswordValidator(this.rules)
            ]
          ]
        },
        {
          validator: [PasswordEqualledValidator]
        }
      );

      this.isInitialized = true;
    } else {
      this.snackBar.open(
        'There are problems during getting validation rules, please contact support.',
        this.translateService.translates.CloseSnackbarBtnText
      );
    }
  }

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'My Profile',
      subHeaderContent: this.subHeaderTemplate
    };

    // translates
    this.translates.currentPasswordInvalidMessage = this.currentPasswordInvalidMessage.nativeElement.innerText;
    this.translates.passwordSuccessfullyMessage = this.passwordSuccessfullyMessage.nativeElement.innerText;

    if (!this.changePasswordForm) {
      return;
    }

    this.changePasswordFieldSubscription = this.changePasswordForm.get(this.changePasswordFormProps.Password).valueChanges.subscribe(() => {
      const invalidRules = this.changePasswordForm.get(this.changePasswordFormProps.Password).errors;
      let rulesPasswordMeter = 'Strong';

      this.invalidPasswordRules = {...invalidRules};

      if (invalidRules) {
        if (invalidRules.length || invalidRules.invalidSpecialSymbols || invalidRules.invalidDigits) {
          rulesPasswordMeter = 'Normal';
        }

        if (invalidRules.invalidUpperCase || invalidRules.invalidLowerCase) {
          rulesPasswordMeter = 'Weak';
        }

        if (invalidRules.required) {
          rulesPasswordMeter = '';
        }
      }

      this.passwordMeterText = rulesPasswordMeter;
    });

    this.changePasswordFormSubscription = this.changePasswordForm.valueChanges.subscribe(() => {
      const invalidRules = this.changePasswordForm.errors;

      if (invalidRules && invalidRules.passwordNotEqualled) {
        this.invalidPasswordRules.passwordNotEqualled = invalidRules.passwordNotEqualled;
      } else {
        delete this.invalidPasswordRules.passwordNotEqualled;
      }
    });
  }

  ngOnDestroy() {
    if (this.changePasswordFieldSubscription) {
      this.changePasswordFieldSubscription.unsubscribe();
    }

    if (this.changePasswordFormSubscription) {
      this.changePasswordFormSubscription.unsubscribe();
    }
  }

  private saveChangePassword(): void {
    markFormControlAsTouched(this.changePasswordForm);

    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isSavingChangePassword = true;
    const model = this.changePasswordForm.value;

    this.authenticationService.changePassword(model.CurrentPassword, model.Password).subscribe(
      () => {
        this.snackBar.open(this.translates.passwordSuccessfullyMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
        this.isSavingChangePassword = false;
      },
      httpError => {
        console.error(httpError);
        const errorCode = httpError && httpError.error && httpError.error.error ? httpError.error.error : '';
        let errorMessage = this.translateService.translates.ErrorMessage;

        if (errorCode === 'InvalidCredentials') {
          errorMessage = this.translates.currentPasswordInvalidMessage;
        }

        this.snackBar.open(errorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
        this.isSavingChangePassword = false;
      }
    );
  }

  save(): void {
    if (this.changePasswordForm.dirty) {
      this.saveChangePassword();
    }
  }
}
