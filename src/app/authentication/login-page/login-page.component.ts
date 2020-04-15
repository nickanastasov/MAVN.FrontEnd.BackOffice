import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthenticationService} from '../authentication.service';
import {AuthTokenService} from 'ngx-api-utils';
import {markFormControlAsTouched} from '../../shared/utils/markFormControlAsTouched';
import {LoginErrorCodes} from './login-error-codes.enum';
import {EmailValidator} from 'src/app/shared/utils/validators';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent implements OnInit {
  loading = false;
  revealPasswordField = true;
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
  registerForm = this.fb.group({
    Email: ['', [Validators.required, EmailValidator]],
    Password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    CompanyLogo: ['', [Validators.required]],
    CompanyColour: ['', [Validators.required]]
  });

  constructor(
    // services
    private authTokenService: AuthTokenService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.loginForm.get(this.loginFormProps.Email).setValue(this.settingsService.DemoUserLogin);
    this.loginForm.get(this.loginFormProps.Password).setValue(this.settingsService.DemoUserPassword);
  }

  ngOnInit() {}

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
          this.loginErrorMessage = 'Unknown error occured, please try again or contact support.';
        }

        console.error(error);

        this.loading = false;
      }
    );
  }

  onTogglePasswordDisplay() {
    this.revealPasswordField = !this.revealPasswordField;
  }

  changeForms() {
    this.registerFormActive = !this.registerFormActive;
  }

  onCompanyLogoChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.registerForm.patchValue({
        CompanyLogo: file
      });
    }
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
