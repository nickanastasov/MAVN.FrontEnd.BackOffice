import {PaymentProvidersService} from './../services/payment-providers.service';
import {Component, OnInit, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import * as constants from 'src/app/core/constants/const';
import {Validators, FormBuilder, FormArray, AbstractControl} from '@angular/forms';
import {
  // validators
  AccuracyValidator,
  LengthValidator,
  MoneyFormatValidator,
  MoneyMaxNumberValidator,
  MoneyMinMoreZeroValidator,
  OnlyLettersValidator,
  PhoneNumberValidator,
  EmailValidator,
} from 'src/app/shared/utils/validators';
import {markFormControlAsTouched} from 'src/app/shared/utils/markFormControlAsTouched';
import {Partner} from '../models/partner.interface';
import {BusinessVerticalTypeItem} from '../models/business-vertical-type-item.interface';
import {MatSnackBar} from '@angular/material/snack-bar';
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
import {ProviderOptions} from '../models/provider-options.interface';
import {Provider} from '../models/provider.interface';
import {PartnerInfo} from '../models/partner-info.interface';
import {PayrexxProviderProperties} from '../models/payrexx-provider-properties.interface';
import {PaymentProvidersType} from '../models/payment-providers-type.enum';
@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.scss'],
})
export class PartnerFormComponent implements OnInit, OnDestroy {
  @Input()
  type: FormMode = FormMode.Create;

  @Output()
  submitSuccess: EventEmitter<{partnerDetails: Partner; partnerProviderDetails: Provider}> = new EventEmitter<{
    partnerDetails: Partner;
    partnerProviderDetails: Provider;
  }>();

  @Input()
  provider: Provider;

  @Input()
  partner: Partner;

  paymentProviders: ProviderOptions[] = [];
  PaymentProvidersType = PaymentProvidersType;
  mapAddress = '';

  assetSymbol = constants.TOKEN_SYMBOL;
  CURRENCY_INPUT_ACCURACY = constants.CURRENCY_INPUT_ACCURACY;
  CURRENCY_INPUT_MAX_NUMBER = constants.CURRENCY_INPUT_MAX_NUMBER;
  CURRENCY_INPUT_MIN_NUMBER = constants.CURRENCY_INPUT_MIN_NUMBER;
  TOKENS_INPUT_ACCURACY = constants.TOKENS_INPUT_ACCURACY;
  TOKENS_INPUT_MAX_NUMBER = constants.TOKENS_INPUT_MAX_NUMBER;

  // #region translates
  @ViewChild('fillRequiredFieldsMessage', {static: true})
  fillRequiredFieldsMessage: ElementRef<HTMLElement>;
  private translates = {
    fillRequiredFieldsMessage: '',
  };

  templates: GlobalTemplates;
  // #endregion
  previousPage = '';

  partnerId: string;
  previousPageSize = '';
  isLoadingProviders: boolean;
  globalRate: GlobalRate;
  private subscriptions: Subscription[] = [];
  private get tokensControl() {
    return this.partnerForm.get(this.partnerFormProps.AmountInTokens);
  }
  private get currencyControl() {
    return this.partnerForm.get(this.partnerFormProps.AmountInCurrency);
  }
  isPartnerAdmin = false;
  hasEditPermission = false;

  constructor(
    private authenticationService: AuthenticationService,
    private paymentProvidersService: PaymentProvidersService,
    private settingsSetvice: SettingsService,
    private fb: FormBuilder,
    private globalSettingsService: GlobalSettingsService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private businessVerticalService: BusinessVerticalService
  ) {
    this.templates = this.translateService.templates;
    this.baseCurrencyCode = this.settingsSetvice.baseCurrencyCode;
    this.isPartnerAdmin = this.authenticationService.isPartnerAdmin();
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ProgramPartners].Edit || this.isPartnerAdmin;
  }

  FormMode = FormMode;
  baseCurrencyCode: string;
  businessVerticalTypes: BusinessVerticalTypeItem[] = [];
  partnerFormProps = {
    Name: 'Name',
    BusinessVertical: 'BusinessVertical',
    Description: 'Description',
    Locations: 'Locations',
    AmountInTokens: 'AmountInTokens',
    AmountInCurrency: 'AmountInCurrency',
    UseGlobalCurrencyRate: 'UseGlobalCurrencyRate',
  };

  partnerForm = this.fb.group({
    [this.partnerFormProps.Name]: [null, [Validators.required, LengthValidator(3, 50)]],
    [this.partnerFormProps.BusinessVertical]: [BusinessVerticalType.Retail, [Validators.required]],
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
        AccuracyValidator(constants.TOKENS_INPUT_ACCURACY),
      ],
    ],
    [this.partnerFormProps.AmountInCurrency]: [
      null,
      [
        // Validators
        Validators.required,
        Validators.min(constants.CURRENCY_INPUT_MIN_NUMBER),
        Validators.max(constants.CURRENCY_INPUT_MAX_NUMBER),
        AccuracyValidator(constants.CURRENCY_INPUT_ACCURACY),
      ],
    ],
    [this.partnerFormProps.UseGlobalCurrencyRate]: [true],
  });
  paymentProvidersFormProps = {
    Providers: 'Providers',
    PaymentProvider: 'PaymentProvider',
    InstanceName: 'InstanceName',
    ApiKey: 'ApiKey',
    IsCheckingPaymentIntegration: 'IsCheckingPaymentIntegration',
    HasCheckingAttempt: 'HasCheckingAttempt',
    IsFailedPaymentIntegration: 'IsFailedPaymentIntegration',
    IsValidPaymentIntegration: 'IsValidPaymentIntegration',
  };
  paymentProvidersForm = this.fb.group({
    [this.paymentProvidersFormProps.Providers]: this.fb.array([]),
  });
  ngOnInit() {
    this.isLoadingProviders = true;
    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.businessVerticalTypes = this.businessVerticalService
      .getBusinessVerticalItems()
      .filter((x) => x.Type !== BusinessVerticalType.RealEstate);

    // translates
    this.translates.fillRequiredFieldsMessage = this.fillRequiredFieldsMessage.nativeElement.innerText;

    this.loadRate();

    if (this.partner) {
      this.partner.Locations.forEach(() => {
        this.locationsFormArray.push(this.generateLocationsFormGroup());
      });

      // TODO: rework when there will be 2 or more payment providers
      this.paymentIntegrationsFormArray.push(this.generatePaymentIntegrationsFormGroup());

      this.partnerForm.reset(this.partner);
      this.providerFormValuesForPartnerEdit();

      if (!this.partner.Locations.length) {
        this.locationsFormArray.push(this.generateLocationsFormGroup());
        this.updateValuesForHiddenLocationFields();
      }

      if (!this.hasEditPermission) {
        this.partnerForm.disable();
        this.paymentProvidersForm.disable();
      }
    } else {
      this.disableRateFields(true);
      this.locationsFormArray.push(this.generateLocationsFormGroup());
      this.paymentIntegrationsFormArray.push(this.generatePaymentIntegrationsFormGroup());
      this.updateValuesForHiddenLocationFields();
    }

    this.subscriptions = [
      this.partnerForm.get(this.partnerFormProps.UseGlobalCurrencyRate).valueChanges.subscribe((value) => {
        if (value) {
          this.setToGlobalRate();
        } else {
          this.disableRateFields(false);
        }
      }),
    ];

    this.previousPage = window.history.state.page;
    this.loadPaymentProviders();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
  providerFormValuesForPartnerEdit() {
    const providerFormRawValue = this.paymentProvidersForm.getRawValue();

    if (this.provider) {
      const providerProperties = JSON.parse(this.provider.PaymentIntegrationProperties) as PayrexxProviderProperties;

      const propertiesForResettingProviderForm = {
        // TODO: rework when there will be 2 or more payment providers
        [this.paymentProvidersFormProps.Providers]: [
          {
            [this.paymentProvidersFormProps.PaymentProvider]: this.provider.PaymentIntegrationProvider,
            [this.paymentProvidersFormProps.InstanceName]: providerProperties.InstanceName,
            [this.paymentProvidersFormProps.ApiKey]: providerProperties.ApiKey,
          },
        ],
      };
      this.paymentProvidersForm.reset(propertiesForResettingProviderForm);
    } else {
      this.paymentProvidersForm.reset(providerFormRawValue);
    }
  }
  private loadPaymentProviders() {
    return this.paymentProvidersService.getAll().subscribe((response) => {
      this.paymentProviders = response.ProvidersRequirements;

      // autoselect by default if there is only one provider
      if (this.paymentProviders && this.paymentProviders.length === 1) {
        this.paymentIntegrationsFormArray.controls[0]
          .get(this.paymentProvidersFormProps.PaymentProvider)
          .setValue(this.paymentProviders[0].PaymentProvider);
      }

      this.isLoadingProviders = false;
    });
  }
  private loadRate(): void {
    this.globalSettingsService.getGlobalRate().subscribe(
      (response) => {
        this.globalRate = response;

        const useGlobalRateControl = this.partnerForm.get(this.partnerFormProps.UseGlobalCurrencyRate);

        if (useGlobalRateControl.value) {
          this.setToGlobalRate();
        }
      },
      (error) => {
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

  // #region Payment Integrations

  checkPaymentIntegration(index: number) {
    if (!this.isPartnerAdmin || !this.paymentProvidersForm.valid) {
      return;
    }

    this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.HasCheckingAttempt).setValue(true);
    this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsCheckingPaymentIntegration).setValue(true);
    this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsFailedPaymentIntegration).setValue(false);

    const model = this.getProviderDetails();

    this.paymentProvidersService.checkPaymentIntegration(model).subscribe(
      (result) => {
        if (result.IsConfiguredCorrectly) {
          this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsValidPaymentIntegration).setValue(true);
        } else {
          this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsFailedPaymentIntegration).setValue(true);
        }
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000,
        });

        this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsFailedPaymentIntegration).setValue(true);
      },
      () => {
        this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsCheckingPaymentIntegration).setValue(false);
      }
    );
  }

  isCheckingPaymentIntegration(index: number): boolean {
    const result = this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsCheckingPaymentIntegration).value;
    return result;
  }

  hasCheckingAttempt(index: number): boolean {
    const result = this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.HasCheckingAttempt).value;
    return result;
  }

  isValidPaymentIntegration(index: number): boolean {
    const result = this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsValidPaymentIntegration).value;
    return result;
  }

  isFailedPaymentIntegration(index: number): boolean {
    const result = this.getPaymentIntegrationControl(index).get(this.paymentProvidersFormProps.IsFailedPaymentIntegration).value;
    return result;
  }

  private getPaymentIntegrationControl(index: number): AbstractControl {
    if (!this.paymentIntegrationsFormArray || !this.paymentIntegrationsFormArray.controls.length || index < 0) {
      return null;
    }

    return this.paymentIntegrationsFormArray.controls[index];
  }

  private getProviderDetails(): Provider {
    const providerValue: {Providers: Array<any>} = this.paymentProvidersForm.getRawValue();

    const providerProperties = providerValue.Providers[0] as PayrexxProviderProperties;

    const {InstanceName, ApiKey} = providerProperties;

    const PaymentIntegrationProperties = JSON.stringify({
      InstanceName,
      ApiKey,
    });

    const providerDetails = {
      PaymentIntegrationProvider: ((providerProperties as any) as ProviderOptions).PaymentProvider,
      PaymentIntegrationProperties,
    } as Provider;

    return providerDetails;
  }

  // #endregion Payment Integrations

  onSubmit() {
    if (!this.hasEditPermission) {
      return;
    }

    const isValidPaymentIntegration = this.paymentProvidersForm.dirty
      ? this.paymentIntegrationsFormArray.controls.every((x) => x.get(this.paymentProvidersFormProps.IsValidPaymentIntegration).value)
      : true;

    markFormControlAsTouched(this.partnerForm);
    markFormControlAsTouched(this.paymentProvidersForm);

    if (!this.partnerForm.valid || !this.paymentProvidersForm.valid || !isValidPaymentIntegration) {
      this.snackBar.open(this.translates.fillRequiredFieldsMessage, this.translateService.translates.CloseSnackbarBtnText, {
        duration: 5000,
      });
      return;
    }

    const partnerValue = this.partnerForm.getRawValue() as Partner;
    const providerDetails = this.paymentProvidersForm.dirty ? this.getProviderDetails() : null;

    const partnerInfo = {
      partnerDetails: partnerValue,
      partnerProviderDetails: providerDetails,
    } as PartnerInfo;

    this.submitSuccess.emit(partnerInfo);
  }

  generateLocationsFormGroup() {
    return this.fb.group({
      Id: [null],
      Name: [null, [Validators.required, LengthValidator(3, 100)]],
      Address: [null, [Validators.required, LengthValidator(3, 100)]],
      FirstName: [null, [Validators.required, OnlyLettersValidator, LengthValidator(2, 50)]],
      LastName: [null, [Validators.required, OnlyLettersValidator, LengthValidator(2, 50)]],
      Phone: [null, [Validators.required, PhoneNumberValidator, LengthValidator(3, 50)]],
      Email: [null, [Validators.required, EmailValidator]],
      ExternalId: [null, [Validators.required, LengthValidator(1, 80)]],
      AccountingIntegrationCode: [null, [Validators.required, LengthValidator(1, 80)]],
    });
  }

  get locationsFormArray() {
    return this.partnerForm.get(this.partnerFormProps.Locations) as FormArray;
  }

  get paymentIntegrationsFormArray() {
    return this.paymentProvidersForm.get(this.paymentProvidersFormProps.Providers) as FormArray;
  }

  onAddLocation() {
    markFormControlAsTouched(this.locationsFormArray);

    if (this.locationsFormArray.invalid) {
      return;
    }

    this.locationsFormArray.push(this.generateLocationsFormGroup());
    this.updateValuesForHiddenLocationFields();
  }

  onAddPaymentProviders() {
    markFormControlAsTouched(this.paymentIntegrationsFormArray);

    if (this.paymentIntegrationsFormArray.invalid) {
      return;
    }

    this.paymentIntegrationsFormArray.push(this.generatePaymentIntegrationsFormGroup());
  }

  generatePaymentIntegrationsFormGroup() {
    return this.fb.group({
      [this.paymentProvidersFormProps.PaymentProvider]: [null, [Validators.required]],
      [this.paymentProvidersFormProps.InstanceName]: [null, [Validators.required, LengthValidator(3, 50)]],
      [this.paymentProvidersFormProps.ApiKey]: [null, [Validators.required, LengthValidator(3, 100)]],
      [this.paymentProvidersFormProps.IsCheckingPaymentIntegration]: [false],
      [this.paymentProvidersFormProps.HasCheckingAttempt]: [false],
      [this.paymentProvidersFormProps.IsFailedPaymentIntegration]: [false],
      [this.paymentProvidersFormProps.IsValidPaymentIntegration]: [false],
    });
  }
  onRemoveLocation(locationIndex: number) {
    this.locationsFormArray.removeAt(locationIndex);
  }

  onRemovePayment(paymentIndex: number) {
    this.paymentIntegrationsFormArray.removeAt(paymentIndex);
  }
  private updateValuesForHiddenLocationFields() {
    if (!this.locationsFormArray.length) {
      return;
    }

    const lastItemIndex = this.locationsFormArray.length - 1;
    const targetLocationForm = this.locationsFormArray.at(lastItemIndex);
    const stubValue = '' + new Date().getTime() + lastItemIndex;
    targetLocationForm.patchValue({
      AccountingIntegrationCode: stubValue,
      ExternalId: stubValue,
    });
  }

  handleAddressBlur(event: any) {
    this.mapAddress = event.target.value;
  }

  handleMapMarkerAddress(address: string, locationIndex: number) {
    const locationsValue = this.partnerForm.get(this.partnerFormProps.Locations).value;

    locationsValue[locationIndex].Address = address;

    this.partnerForm.get(this.partnerFormProps.Locations).setValue(locationsValue);
  }
}
