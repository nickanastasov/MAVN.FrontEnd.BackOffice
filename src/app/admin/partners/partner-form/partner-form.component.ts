import {Component, OnInit, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import * as constants from 'src/app/core/constants/const';
import {Validators, FormBuilder, FormArray} from '@angular/forms';
import {
  // validators
  AccuracyValidator,
  LengthValidator,
  MoneyFormatValidator,
  MoneyMaxNumberValidator,
  MoneyMinMoreZeroValidator,
  OnlyLettersValidator,
  PhoneNumberValidator,
  EmailValidator
} from 'src/app/shared/utils/validators';
import {markFormControlAsTouched} from 'src/app/shared/utils/markFormControlAsTouched';
import {Partner} from '../models/partner.interface';
import {BusinessVerticalTypeItem} from '../models/business-vertical-type-item.interface';
import {PartnersService} from '../partners.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {BusinessVerticalService} from '../services/business-vertical.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {GlobalSettingsService} from '../../global-settings/services/global-settings.service';
import {Subscription} from 'rxjs';
import {GlobalRate} from '../../global-settings/models/global-rate.interface';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {BusinessVerticalType} from '../models/business-vertical.enum';

@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.scss']
})
export class PartnerFormComponent implements OnInit, OnDestroy {
  @Input()
  type: FormMode = FormMode.Create;

  @Output()
  submitSuccess: EventEmitter<Partner> = new EventEmitter<Partner>();

  @Input()
  partner: Partner;

  assetSymbol = constants.TOKEN_SYMBOL;
  CURRENCY_INPUT_ACCURACY = constants.CURRENCY_INPUT_ACCURACY;
  CURRENCY_INPUT_MAX_NUMBER = constants.CURRENCY_INPUT_MAX_NUMBER;
  CURRENCY_INPUT_MIN_NUMBER = constants.CURRENCY_INPUT_MIN_NUMBER;
  TOKENS_INPUT_ACCURACY = constants.TOKENS_INPUT_ACCURACY;
  TOKENS_INPUT_MAX_NUMBER = constants.TOKENS_INPUT_MAX_NUMBER;

  templates: GlobalTemplates;
  previousPage = '';
  previousPageSize = '';

  globalRate: GlobalRate;
  private subscriptions: Subscription[] = [];
  private get tokensControl() {
    return this.partnerForm.get(this.partnerFormProps.AmountInTokens);
  }
  private get currencyControl() {
    return this.partnerForm.get(this.partnerFormProps.AmountInCurrency);
  }
  hasEditPermission = false;

  constructor(
    private authenticationService: AuthenticationService,
    private settingsSetvice: SettingsService,
    private fb: FormBuilder,
    private globalSettingsService: GlobalSettingsService,
    private partnerService: PartnersService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private businessVerticalService: BusinessVerticalService,
    private dialog: MatDialog
  ) {
    this.templates = this.translateService.templates;
    this.baseCurrencyCode = this.settingsSetvice.baseCurrencyCode;
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ProgramPartners].Edit;
  }

  FormMode = FormMode;
  revealPasswordField = true;
  hideGeneratePassBtn = false;
  defaultPasswordValue = '**********';
  copyToClipboardPass = '';
  copyToClipboardLogin = '';
  baseCurrencyCode: string;

  businessVerticalTypes: BusinessVerticalTypeItem[] = [];

  // #region translates

  @ViewChild('editChangeClientLoginMessageTemplate')
  editChangeClientLoginMessageTemplate: ElementRef<HTMLElement>;
  @ViewChild('createChangeClientLoginMessageTemplate')
  createChangeClientLoginMessageTemplate: ElementRef<HTMLElement>;

  private translates = {
    editChangeClientLoginMessage: '',
    createChangeClientLoginMessage: ''
  };

  partnerFormProps = {
    Name: 'Name',
    BusinessVertical: 'BusinessVertical',
    ClientId: 'ClientId',
    ClientSecret: 'ClientSecret',
    Description: 'Description',
    Locations: 'Locations',
    AmountInTokens: 'AmountInTokens',
    AmountInCurrency: 'AmountInCurrency',
    UseGlobalCurrencyRate: 'UseGlobalCurrencyRate'
  };

  partnerForm = this.fb.group({
    [this.partnerFormProps.Name]: [null, [Validators.required, LengthValidator(3, 50)]],
    [this.partnerFormProps.BusinessVertical]: [null, [Validators.required]],
    [this.partnerFormProps.ClientId]: [{value: null, disabled: true}, [Validators.required]],
    [this.partnerFormProps.ClientSecret]: [{value: null, disabled: true}, [Validators.required]],
    [this.partnerFormProps.Description]: [null, LengthValidator(3, 1000)],
    [this.partnerFormProps.Locations]: this.fb.array([]),
    [this.partnerFormProps.AmountInTokens]: [
      null,
      [
        // validators
        Validators.required,
        MoneyFormatValidator(),
        MoneyMinMoreZeroValidator(),
        MoneyMaxNumberValidator(),
        AccuracyValidator(constants.TOKENS_INPUT_ACCURACY)
      ]
    ],
    [this.partnerFormProps.AmountInCurrency]: [
      null,
      [
        // Validators
        Validators.required,
        Validators.min(constants.CURRENCY_INPUT_MIN_NUMBER),
        Validators.max(constants.CURRENCY_INPUT_MAX_NUMBER),
        AccuracyValidator(constants.CURRENCY_INPUT_ACCURACY)
      ]
    ],
    [this.partnerFormProps.UseGlobalCurrencyRate]: [true]
  });

  ngOnInit() {
    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.businessVerticalTypes = this.businessVerticalService
      .getBusinessVerticalItems()
      .filter(x => x.Type !== BusinessVerticalType.RealEstate);
    this.translates.createChangeClientLoginMessage = this.createChangeClientLoginMessageTemplate.nativeElement.innerText;
    this.translates.editChangeClientLoginMessage = this.editChangeClientLoginMessageTemplate.nativeElement.innerText;

    this.loadRate();

    if (this.partner) {
      this.partner.Locations.forEach(() => {
        this.locationsFormArray.push(this.generateLocationsFormGroup());
      });

      this.copyToClipboardLogin = this.partner.ClientId.toString();
      this.partnerForm.reset(this.partner);

      if (!this.hasEditPermission) {
        this.partnerForm.disable();
      }
    } else {
      this.disableRateFields(true);
      this.locationsFormArray.push(this.generateLocationsFormGroup());
    }

    this.partnerForm.controls['ClientSecret'].patchValue(this.defaultPasswordValue);

    if (this.type === 'Create') {
      this.revealPasswordField = false;

      this.partnerService.generateClientIdAsync().subscribe(response => {
        this.partnerForm.controls['ClientId'].patchValue(response);
        this.copyToClipboardLogin = response.toString();
      });

      this.partnerService.generateClientSecretAsync().subscribe(response => {
        this.partnerForm.controls['ClientSecret'].patchValue(response);
        this.copyToClipboardPass = response.toString();
      });
    }

    this.subscriptions = [
      this.partnerForm.get(this.partnerFormProps.UseGlobalCurrencyRate).valueChanges.subscribe(value => {
        if (value) {
          this.setToGlobalRate();
        } else {
          this.disableRateFields(false);
        }
      })
    ];

    this.previousPage = window.history.state.page;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private loadRate(): void {
    this.globalSettingsService.getGlobalRate().subscribe(
      response => {
        this.globalRate = response;

        const useGlobalRateControl = this.partnerForm.get(this.partnerFormProps.UseGlobalCurrencyRate);

        if (useGlobalRateControl.value) {
          this.setToGlobalRate();
        }
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private setToGlobalRate(): void {
    if (!this.globalRate) {
      return;
    }

    this.tokensControl.setValue(this.globalRate.AmountInTokens);
    this.currencyControl.setValue(this.globalRate.AmountInCurrency);
    this.disableRateFields(true);
  }

  private disableRateFields(disable: boolean): void {
    if (disable) {
      this.tokensControl.disable();
      this.currencyControl.disable();
    } else {
      this.tokensControl.enable();
      this.currencyControl.enable();
    }
  }

  onSubmit() {
    if (!this.hasEditPermission) {
      return;
    }

    markFormControlAsTouched(this.partnerForm);

    if (!this.partnerForm.valid) {
      return;
    }

    if (this.partnerForm.controls['ClientSecret'].value === this.defaultPasswordValue) {
      this.partnerForm.controls['ClientSecret'].patchValue(null);
    }

    this.submitSuccess.emit(this.partnerForm.getRawValue());
  }

  generateLocationsFormGroup() {
    return this.fb.group({
      Id: [null],
      Name: [null, [Validators.required, LengthValidator(3, 100)]],
      Address: [null, [Validators.required, LengthValidator(3, 100)]],
      FirstName: [null, [Validators.required, OnlyLettersValidator, LengthValidator(2, 50)]],
      LastName: [null, [Validators.required, OnlyLettersValidator, LengthValidator(2, 50)]],
      Phone: [null, [Validators.required, PhoneNumberValidator, LengthValidator(2, 50)]],
      Email: [null, [Validators.required, EmailValidator]],
      ExternalId: [null, [Validators.required, LengthValidator(1, 80)]],
      AccountingIntegrationCode: [null, [Validators.required, LengthValidator(1, 80)]]
    });
  }

  get locationsFormArray() {
    return this.partnerForm.get('Locations') as FormArray;
  }

  onAddLocation() {
    markFormControlAsTouched(this.locationsFormArray);

    if (this.locationsFormArray.invalid) {
      return;
    }

    this.locationsFormArray.push(this.generateLocationsFormGroup());
  }

  onRemoveLocation(locationIndex: number) {
    this.locationsFormArray.removeAt(locationIndex);
  }

  changeClietSecret() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Message: 'Do you want to generate new partner password?'
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.partnerService.generateClientSecretAsync().subscribe(response => {
          this.partnerForm.controls['ClientSecret'].patchValue(response);
          this.revealPasswordField = false;
          this.copyToClipboardPass = response.toString();
        });
      }
    });
  }

  changeClietId() {
    var message =
      this.type === 'Edit' && this.partnerForm.controls['ClientSecret'].value === this.defaultPasswordValue
        ? this.translates.editChangeClientLoginMessage
        : this.translates.createChangeClientLoginMessage;

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Message: message
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.partnerService.generateClientIdAsync().subscribe(response => {
          this.partnerForm.controls['ClientId'].patchValue(response);
          this.copyToClipboardLogin = response.toString();
        });

        if (this.type === 'Edit' && this.partnerForm.controls['ClientSecret'].value === this.defaultPasswordValue) {
          this.partnerService.generateClientSecretAsync().subscribe(response => {
            this.partnerForm.controls['ClientSecret'].patchValue(response);

            this.copyToClipboardPass = response.toString();

            this.revealPasswordField = false;
          });

          this.hideGeneratePassBtn = true;
        }
      }
    });
  }
}
