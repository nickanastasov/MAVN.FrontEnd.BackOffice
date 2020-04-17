import {Component, OnInit, ViewEncapsulation, Inject, LOCALE_ID, OnDestroy} from '@angular/core';
import {FormBuilder, Validators, FormGroup, ValidationErrors} from '@angular/forms';
import {AuthenticationService} from '../authentication.service';
import {AuthTokenService} from 'ngx-api-utils';
import {markFormControlAsTouched} from '../../shared/utils/markFormControlAsTouched';
import {LoginErrorCodes} from './login-error-codes.enum';
import {EmailValidator, LengthValidator, PasswordValidator, PasswordEqualledValidator} from 'src/app/shared/utils/validators';
import {SettingsService} from 'src/app/core/settings/settings.service';

import {LOCALES} from 'src/app/core/constants/const';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {PasswordValidationRules} from 'src/app/shared/models/password-validation.interface';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loading = false;
  revealPasswordField = true;
  revealRepeatPasswordField = true;
  loginErrorMessage: string;
  loginFormProps = {
    Email: 'Email',
    Password: 'Password'
  };
  registerErrorMessage: string;
  registerFormActive = false;
  loginForm = this.fb.group({
    [this.loginFormProps.Email]: ['', [Validators.required, EmailValidator]],
    [this.loginFormProps.Password]: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]]
  });
  registerFormProps = {
    CompanyName: 'CompanyName',
    Email: 'Email',
    Password: 'Password',
    RepeatPassword: 'RepeatPassword'
  };
  rules: PasswordValidationRules;
  invalidPasswordRules: ValidationErrors = {};
  registerForm: FormGroup;
  private passwordFieldSubscription: Subscription;
  private registerFormSubscription: Subscription;

  LOCALES = LOCALES;
  currentLocale = '';

  constructor(
    // services
    private authTokenService: AuthTokenService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    if (this.locale.startsWith(LOCALES.English)) {
      this.currentLocale = LOCALES.English;
    } else if (this.locale.startsWith(LOCALES.German)) {
      this.currentLocale = LOCALES.German;
    }

    this.loginForm.get(this.loginFormProps.Email).setValue(this.settingsService.DemoUserLogin);
    this.loginForm.get(this.loginFormProps.Password).setValue(this.settingsService.DemoUserPassword);

    if (this.settingsService.PasswordValidationRules) {
      this.rules = this.settingsService.PasswordValidationRules;

      this.registerForm = this.fb.group(
        {
          [this.registerFormProps.CompanyName]: ['', [Validators.required, LengthValidator(3, 255)]],
          [this.registerFormProps.Email]: ['', [Validators.required, EmailValidator]],
          [this.registerFormProps.Password]: [
            null,
            [
              // validators
              Validators.required,
              LengthValidator(this.rules.MinLength, this.rules.MaxLength),
              PasswordValidator(this.rules)
            ]
          ],
          [this.registerFormProps.RepeatPassword]: [
            null,
            [
              // validators
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
    }
  }

  ngOnInit() {
    if (!this.registerForm) {
      return;
    }

    this.passwordFieldSubscription = this.registerForm.get(this.registerFormProps.Password).valueChanges.subscribe(() => {
      const invalidRules = this.registerForm.get(this.registerFormProps.Password).errors;

      this.invalidPasswordRules = {...invalidRules};
    });

    this.registerFormSubscription = this.registerForm.valueChanges.subscribe(() => {
      const invalidRules = this.registerForm.errors;

      if (invalidRules && invalidRules.passwordNotEqualled) {
        this.invalidPasswordRules.passwordNotEqualled = invalidRules.passwordNotEqualled;
      } else {
        delete this.invalidPasswordRules.passwordNotEqualled;
      }
    });
  }

  ngOnDestroy() {
    if (this.passwordFieldSubscription) {
      this.passwordFieldSubscription.unsubscribe();
    }

    if (this.registerFormSubscription) {
      this.registerFormSubscription.unsubscribe();
    }
  }

  changeLanguage(locale: string) {
    const l = window.location;

    const langCode = '/' + locale;
    const pathname = langCode + l.pathname.substr(langCode.length);

    this.authService.isChangingLanguage = true;

    window.location.href = l.origin + pathname + l.search;
  }

  onLoginSubmit() {
    markFormControlAsTouched(this.loginForm);

    if (!this.loginForm.valid) {
      return;
    }

    this.loginErrorMessage = '';
    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe(
      response => {
        this.authService.setUserData(response.AdminUser);
        this.authTokenService.value$.next(response.Token);
        this.authService.setCookieToken(response.Token);
      },
      ({error}) => {
        if (error.error === LoginErrorCodes.InvalidCredentials) {
          this.loginErrorMessage = error.message;
          this.loginForm.setErrors({invalidLogin: true});
        } else if (error.error === LoginErrorCodes.InvalidEmailFormat) {
          this.loginErrorMessage = error.message;
          this.loginForm.get(this.loginFormProps.Email).setErrors({email: true});
        } else if (error) {
          this.loginErrorMessage = error.error + ': ' + error.message;
        } else {
          this.loginErrorMessage = this.translateService.globalTranslates.ErrorMessage;
        }

        console.error(error);

        this.loading = false;
      }
    );
  }

  onTogglePasswordDisplay() {
    this.revealPasswordField = !this.revealPasswordField;
  }

  onToggleRepeatPasswordDisplay() {
    this.revealRepeatPasswordField = !this.revealRepeatPasswordField;
  }

  changeForms() {
    this.registerFormActive = !this.registerFormActive;
  }

  onRegisterSubmit() {
    markFormControlAsTouched(this.registerForm);

    if (!this.registerForm.valid) {
      return;
    }

    this.registerErrorMessage = '';
    this.loading = true;
  }
}
