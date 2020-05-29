import {
  // components
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {FormArray, FormBuilder, Validators, AbstractControl, ValidatorFn} from '@angular/forms';
import {markFormControlAsTouched} from '../../../shared/utils/markFormControlAsTouched';
import {
  // validators
  LengthValidator,
  FileSizeValidator,
  FileExtensionValidator,
  FileDimensionsValidator,
  IntegerValidator,
} from '../../../shared/utils/validators';
import {Subscription} from 'rxjs';
import {SmartVoucherCampaign} from '../models/smart-voucher.interface';
import {MobileLanguage} from '../../../shared/models/mobile-language.enum';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {DictionaryService} from 'src/app/shared/services/dictionary.service';
import * as constants from 'src/app/core/constants/const';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {PartnersService} from '../../partners/partners.service';
import {PartnerRowResponse} from '../../partners/models/partner-row.interface';
import {PartnersContainer} from '../../partners/models/partners-container.interface';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {GlobalRate} from '../../global-settings/models/global-rate.interface';
import {SettingsService} from 'src/app/core/settings/settings.service';
import * as actionRulesConstants from '../../action-rule/constants/const';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {ROUTE_ADMIN_ROOT, ROUTE_SMART_VOUCHERS} from 'src/app/core/constants/routes';
import {SmartVoucherCampaignState} from '../models/smart-voucher-campaign-state.enum';
import {SmartVoucherService} from '../smart-voucher.service';
import {CountriesService} from 'src/app/shared/services/countries.service';

@Component({
  selector: 'app-smart-voucher-form',
  templateUrl: './smart-voucher-form.component.html',
  styleUrls: ['./smart-voucher-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SmartVoucherFormComponent implements OnInit, OnDestroy {
  @Input()
  type: FormMode = FormMode.Create;

  @Input()
  isSaving: boolean;

  @Output()
  submitSuccess: EventEmitter<SmartVoucherCampaign> = new EventEmitter<SmartVoucherCampaign>();

  @Input()
  voucherCampaign: SmartVoucherCampaign;

  // bindable fields
  FormMode = FormMode;
  SmartVoucherCampaignState = SmartVoucherCampaignState;
  tokenSymbol = constants.TOKEN_SYMBOL;
  navigateToListUrl = `${ROUTE_ADMIN_ROOT}/${ROUTE_SMART_VOUCHERS}`;
  CURRENCY_INPUT_ACCURACY = constants.CURRENCY_INPUT_ACCURACY;
  CURRENCY_INPUT_MAX_NUMBER = constants.CURRENCY_INPUT_MAX_NUMBER;
  CURRENCY_INPUT_MIN_NUMBER = constants.CURRENCY_INPUT_MIN_NUMBER;
  INTEGER_MAX_NUMBER = constants.INTEGER_MAX_NUMBER;
  TOKENS_INPUT_ACCURACY = constants.TOKENS_INPUT_ACCURACY;
  TOKENS_INPUT_MAX_NUMBER = constants.TOKENS_INPUT_MAX_NUMBER;
  MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION = actionRulesConstants.MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION;
  baseCurrencyCode: string;
  isLoadingCurrencies: boolean;
  // partners
  isLoadingPartners: boolean;
  partners: PartnerRowResponse[] = [];
  partnersDict: {[Id: string]: PartnerRowResponse} = null;
  voucherCampaignFormProps = {
    Name: 'Name',
    FromDate: 'FromDate',
    ToDate: 'ToDate',
    VouchersTotalCount: 'VouchersTotalCount',
    VoucherPrice: 'VoucherPrice',
    Currency: 'Currency',
    Currencies: 'Currencies',
    PartnerId: 'PartnerId',
    PartnersSearch: 'PartnersSearch',
    Description: 'Description',
    MobileContents: 'MobileContents',
    IsPublished: 'IsPublished',
  };
  VouchersCount = 0;
  BoughtVouchersCount = 0;
  VouchersInStockCount = 0;
  //#region Permissions
  hasEditPermission = false;
  isPartnerAdmin = false;
  isCheckingAbilityToPublish = false;
  isEnabledToPublish = false;
  //#endregion
  globalRate: GlobalRate;
  isLoadingRate = true;

  //#region bindable fields - mobile content related
  MobileAppImageFileSizeInKB: number;
  MobileAppImageMinWidth: number;
  MobileAppImageMinHeight: number;
  mobileContentFormProps = {
    MobileLanguage: 'MobileLanguage',
    Title: 'Title',
    Description: 'Description',
    File: 'File',
    ImageBlobUrl: 'ImageBlobUrl',
  };
  contentPreviewTitle: string;
  contentPreviewDescription: string;
  contentPreviewImageUrl: string;
  mobileLanguages = MobileLanguage;
  availableMobileLanguages: MobileLanguage[] = [];
  //#endregion
  todayDate = new Date();

  //#region private
  private subscriptions: Subscription[] = [];
  private rateDependencyLoadedEventEmitter = new EventEmitter();
  private emptyPartnerIdValue = '';

  //#region private - mobile content related
  private subscriptionsContentPreview: Subscription[] = [];
  private isTitleCopied: boolean;
  private isDescriptionCopied: boolean;
  private imageUrlsDictionary: {[language: string]: string} = {};
  //#endregion
  //#endregion
  // #region translates
  @ViewChild('fillRequiredFieldsMessage', {static: true})
  fillRequiredFieldsMessage: ElementRef<HTMLElement>;
  private translates = {
    fillRequiredFieldsMessage: '',
  };

  templates: GlobalTemplates;
  // #endregion

  constructor(
    private authenticationService: AuthenticationService,
    private countriesService: CountriesService,
    private dictionaryService: DictionaryService,
    private fb: FormBuilder,
    private partnersService: PartnersService,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private smartVoucherService: SmartVoucherService,
    private translateService: TranslateService
  ) {
    this.isPartnerAdmin = this.authenticationService.isPartnerAdmin();
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.VoucherManager].Edit || this.isPartnerAdmin;
    this.templates = this.translateService.templates;
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.MobileAppImageFileSizeInKB = this.settingsService.MobileAppImageFileSizeInKB;
    this.MobileAppImageMinWidth = this.settingsService.MobileAppImageMinWidth;
    this.MobileAppImageMinHeight = this.settingsService.MobileAppImageMinHeight;
  }

  voucherCampaignForm = this.fb.group({
    [this.voucherCampaignFormProps.Name]: [null, [Validators.required, LengthValidator(3, 50)]],
    [this.voucherCampaignFormProps.FromDate]: [null, [Validators.required]],
    [this.voucherCampaignFormProps.ToDate]: [null],
    [this.voucherCampaignFormProps.VouchersTotalCount]: [
      null,
      [
        // validators
        Validators.required,
        Validators.min(1),
        Validators.max(constants.INTEGER_MAX_NUMBER),
        IntegerValidator,
      ],
    ],
    [this.voucherCampaignFormProps.VoucherPrice]: [
      null,
      [
        // validators
        Validators.required,
        Validators.min(0),
        Validators.max(constants.INTEGER_MAX_NUMBER),
        IntegerValidator,
      ],
    ],
    [this.voucherCampaignFormProps.Currency]: [null],
    [this.voucherCampaignFormProps.Currencies]: [null],
    [this.voucherCampaignFormProps.PartnersSearch]: [null],
    [this.voucherCampaignFormProps.PartnerId]: [this.emptyPartnerIdValue, [Validators.required]],
    [this.voucherCampaignFormProps.Description]: [null, [LengthValidator(3, 1000)]],
    [this.voucherCampaignFormProps.MobileContents]: this.fb.array([]),
    [this.voucherCampaignFormProps.IsPublished]: [false],
  });

  get mobileContentsFormArray() {
    return this.voucherCampaignForm.get(this.voucherCampaignFormProps.MobileContents) as FormArray;
  }
  get isPublishedControl(): AbstractControl {
    return this.voucherCampaignForm.get(this.voucherCampaignFormProps.IsPublished);
  }
  get mobileContentsEnglishOnly(): AbstractControl[] {
    return this.mobileContentsFormArray.controls
      ? this.mobileContentsFormArray.controls.filter((x) => x.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En)
      : this.mobileContentsFormArray.controls;
  }

  previousPage = '';
  previousPageSize = '';

  ngOnInit() {
    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;

    // translates
    this.translates.fillRequiredFieldsMessage = this.fillRequiredFieldsMessage.nativeElement.innerText;

    // load related data
    this.loadAllPartners();

    if (this.voucherCampaign) {
      if (this.voucherCampaign.PartnerId && !this.voucherCampaign.PartnerId.length) {
        this.voucherCampaign.PartnerId = this.emptyPartnerIdValue;
      }

      //#region mobile content related
      this.voucherCampaign.MobileContents.forEach((mobContent) => {
        this.mobileContentsFormArray.push(this.generateMobileContentFormGroup(mobContent.MobileLanguage, !!mobContent.ImageId));

        // store image urls
        if (mobContent && mobContent.Image) {
          this.imageUrlsDictionary[mobContent.MobileLanguage] = mobContent.Image.ImageBlobUrl;
        }
      });
      //#endregion

      this.voucherCampaignForm.reset(this.voucherCampaign);

      this.VouchersCount = this.voucherCampaign.VouchersTotalCount;
      this.BoughtVouchersCount = this.voucherCampaign.BoughtVouchersCount;
      this.VouchersInStockCount = this.VouchersCount - this.BoughtVouchersCount;

      this.voucherCampaignForm
        .get(this.voucherCampaignFormProps.IsPublished)
        .setValue(this.voucherCampaign.State === SmartVoucherCampaignState.Published);

      if (this.hasEditPermission) {
        if (this.isPartnerAdmin) {
          this.checkAbilityToPublish(this.voucherCampaign.PartnerId);
        } else {
          this.isEnabledToPublish = true;
        }
      }

      if (this.voucherCampaign.State === SmartVoucherCampaignState.Published) {
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.PartnerId).disable();
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.FromDate).disable();
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.VoucherPrice).disable();
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.VouchersTotalCount).disable();
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.Currency).disable();
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.IsPublished).disable();
      }

      if (!this.voucherCampaign.Currency) {
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.Currency).setValue(this.baseCurrencyCode);
      }

      if (!this.hasEditPermission || this.voucherCampaign.State === SmartVoucherCampaignState.Deleted) {
        this.voucherCampaignForm.disable();
      }
    } else {
      //#region mobile content related
      this.availableMobileLanguages = this.dictionaryService.getMobileLanguages();
      this.availableMobileLanguages.forEach((language) => {
        this.mobileContentsFormArray.push(this.generateMobileContentFormGroup(language));
      });
      //#endregion
    }

    // mobile content related
    // Because for now only English used and order of languages is not fixed so need to find En content
    for (let i = 0; i < this.mobileContentsFormArray.controls.length; i++) {
      const control = this.mobileContentsFormArray.controls[i];

      if (control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En) {
        this.updateContentPreviewBindings(i);
        break;
      }
    }

    this.subscriptions = [];

    if (this.hasEditPermission) {
      this.subscriptions.push(
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.PartnerId).valueChanges.subscribe((value) => {
          this.checkAbilityToPublish(value);
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    // mobile content related
    this.subscriptionsContentPreview.forEach((subscription) => subscription.unsubscribe());
  }

  //#region Partners

  private loadAllPartners() {
    this.isLoadingPartners = true;

    const page = 1;
    this.loadPagedPartners(page);
  }

  private loadPagedPartners(page: number) {
    this.partnersService.getAll(constants.MAX_PAGE_SIZE, page, '').subscribe(
      (response) => {
        this.partners = [...this.partners, ...response.Partners];

        if (this.partners.length >= response.PagedResponse.TotalCount) {
          this.partners = this.partners.sort((a, b) => (a.Name > b.Name ? 1 : -1));

          this.partnersDict = this.partners.reduce((obj, item) => {
            obj[item.Id] = item;
            return obj;
          }, {} as {[Id: string]: PartnerRowResponse});

          this.isLoadingPartners = false;
          this.rateDependencyLoadedEventEmitter.emit();

          // autoselect if there is only 1 partner
          if (this.partners.length === 1) {
            this.voucherCampaignForm.get(this.voucherCampaignFormProps.PartnerId).setValue(this.partners[0].Id);
          }

          this.partnersChanged();
        } else {
          page++;
          this.loadPagedPartners(page);
        }
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isLoadingPartners = false;
      }
    );
  }

  partnersChanged() {
    const partnerId = this.voucherCampaignForm.get(this.voucherCampaignFormProps.PartnerId).value;

    if (partnerId) {
      const partner = this.partnersDict[partnerId];

      if (!partner) {
        return;
      }

      // #region load currencies for certain partner
      if (partner.ProvidersSupportedCurrencies) {
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.Currencies).setValue(partner.ProvidersSupportedCurrencies);
        this.setDefaultCurrency(partner);
      } else {
        this.isLoadingCurrencies = true;

        this.smartVoucherService.getCurrenciesForPartner(partnerId).subscribe(
          (response) => {
            if (response.ProvidersSupportedCurrencies) {
              partner.ProvidersSupportedCurrencies = response.ProvidersSupportedCurrencies.sort((a, b) => (a > b ? 1 : -1));
              this.voucherCampaignForm.get(this.voucherCampaignFormProps.Currencies).setValue(partner.ProvidersSupportedCurrencies);
              this.setDefaultCurrency(partner);
            } else {
              this.isLoadingCurrencies = false;
            }
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000,
            });

            this.isLoadingCurrencies = false;
          }
        );
      }
      //#endregion
    }
  }

  // set default currency based on partner's country
  private setDefaultCurrency(partner: PartnerRowResponse) {
    if (partner.CountryIso3Code) {
      this.setCurrencyWhenDataLoaded(partner);
    } else {
      this.partnersService.getById(partner.Id).subscribe(
        (response) => {
          if (response.Locations && response.Locations.length) {
            partner.CountryIso3Code = response.Locations[0].CountryIso3Code;
            this.setCurrencyWhenDataLoaded(partner);
          } else {
            this.isLoadingCurrencies = false;
          }
        },
        () => {
          this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
            duration: 5000,
          });
          this.isLoadingCurrencies = false;
        }
      );
    }
  }

  private setCurrencyWhenDataLoaded(partner: PartnerRowResponse) {
    if (partner.CountryIso3Code) {
      const currency = this.countriesService.getCurrencyByCountryIso3Code(partner.CountryIso3Code);

      if (partner.ProvidersSupportedCurrencies && partner.ProvidersSupportedCurrencies.some((x) => x === currency)) {
        this.voucherCampaignForm.get(this.voucherCampaignFormProps.Currency).setValue(currency);
      }
    }

    this.isLoadingCurrencies = false;
  }

  private checkAbilityToPublish(partnerId: string) {
    this.isCheckingAbilityToPublish = true;
    this.isEnabledToPublish = false;
    // disable control and reset value
    const valueBeforeChecking: boolean = this.isPublishedControl.value;
    this.isPublishedControl.disable();
    this.isPublishedControl.setValue(false);

    this.partnersService.checkAbilityToPublish(partnerId).subscribe(
      (res) => {
        this.isEnabledToPublish = res.HasAbility;

        if (this.isEnabledToPublish) {
          this.isPublishedControl.enable();

          if (valueBeforeChecking) {
            this.isPublishedControl.setValue(valueBeforeChecking);
          }
        }
      },
      () => {
        this.isEnabledToPublish = false;
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      },
      () => {
        this.isCheckingAbilityToPublish = false;
      }
    );
  }

  //#endregion Partners

  // #region Mobile Content

  private generateMobileContentFormGroup(language: MobileLanguage | string, hasImage: boolean = null) {
    const titleValidators: ValidatorFn[] = [];
    const descriptionValidators: ValidatorFn[] = [];
    const fileValidators: ValidatorFn[] = [];

    if (language === MobileLanguage.En) {
      titleValidators.push(Validators.required);
      descriptionValidators.push(Validators.required);

      if (!hasImage) {
        // fileValidators.push(Validators.required); // uncomment when image should be mandatory
      }
    }

    titleValidators.push(LengthValidator(3, 50));
    descriptionValidators.push(LengthValidator(3, 1000));
    fileValidators.push(
      ...[FileExtensionValidator(this.getAcceptFilesExtensions()), FileSizeValidator(this.settingsService.MobileAppImageFileSizeInKB)]
    );

    return this.fb.group({
      [this.mobileContentFormProps.MobileLanguage]: [language],
      [this.mobileContentFormProps.Title]: [null, titleValidators],
      [this.mobileContentFormProps.Description]: [null, descriptionValidators],
      [this.mobileContentFormProps.File]: [
        null,
        fileValidators,
        [FileDimensionsValidator(this.MobileAppImageMinWidth, this.MobileAppImageMinHeight)],
      ],
      [this.mobileContentFormProps.ImageBlobUrl]: [null],
    });
  }

  getAcceptFilesExtensions(): string {
    return actionRulesConstants.MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION;
  }

  onTitleBlur() {
    if (!this.isTitleCopied && this.type === FormMode.Create) {
      const titleControl = this.voucherCampaignForm.get(this.voucherCampaignFormProps.Name);

      if (titleControl.value && titleControl.valid) {
        const mobileContentTitleControl = this.mobileContentsFormArray.controls.find(
          (control) => control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En
        );

        if (mobileContentTitleControl) {
          mobileContentTitleControl.get(this.mobileContentFormProps.Title).setValue(titleControl.value);
          this.isTitleCopied = true;
        }
      }
    }
  }

  onDescriptionBlur() {
    if (!this.isDescriptionCopied && this.type === FormMode.Create) {
      const descriptionControl = this.voucherCampaignForm.get(this.voucherCampaignFormProps.Description);

      if (descriptionControl.value && descriptionControl.valid) {
        const mobileContentTitleControl = this.mobileContentsFormArray.controls.find(
          (control) => control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En
        );

        if (mobileContentTitleControl) {
          mobileContentTitleControl.get(this.mobileContentFormProps.Description).setValue(descriptionControl.value);
          this.isDescriptionCopied = true;
        }
      }
    }
  }

  addFiles(files: FileList /*, index: number*/): void {
    if (!files || files.length === 0) {
      return;
    }

    // const fileControl = this.mobileContentsFormArray.at(index).get(this.mobileContentFormProps.File);
    // Because for now only English used, so index is not convenient
    const fileControl = this.mobileContentsFormArray.controls
      .find((control) => control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En)
      .get(this.mobileContentFormProps.File);

    markFormControlAsTouched(fileControl);
    fileControl.setValue(files[0]);
    fileControl.updateValueAndValidity();

    // This is a workaround with an issue that the Angular team has not fixed yet.
    // The issue is that when you have AsyncValidator, you don't receive properly whether the field is valid or not.
    // The main idea here is to run this function on the next event lifecycle.
    // It works with value of "1", but just to be sure, I put "200". It does not interfere with the performance and the user flow.
    setTimeout(() => {
      this.updateContentPreviewImageUrl(fileControl);
    }, 200);
  }

  private updateContentPreviewImageUrl(fileControl: AbstractControl) {
    if (fileControl.value && fileControl.valid) {
      const reader = new FileReader();
      reader.onload = () => (this.contentPreviewImageUrl = reader.result as string);
      reader.readAsDataURL(fileControl.value);
    } else {
      this.contentPreviewImageUrl = null;
    }
  }

  selectedTabIndexChange(index: number) {
    this.updateContentPreviewBindings(index);
  }

  private updateContentPreviewBindings(selectedTabIndex: number) {
    const currentTabFormGroup = this.mobileContentsFormArray.at(selectedTabIndex);

    const mobileLanguage = currentTabFormGroup.get(this.mobileContentFormProps.MobileLanguage).value;
    const titleControl = currentTabFormGroup.get(this.mobileContentFormProps.Title);
    const descriptionControl = currentTabFormGroup.get(this.mobileContentFormProps.Description);
    const fileControl = currentTabFormGroup.get(this.mobileContentFormProps.File);

    if (fileControl && fileControl.value && fileControl.valid) {
      this.updateContentPreviewImageUrl(fileControl);
    } else if (this.imageUrlsDictionary[mobileLanguage]) {
      this.contentPreviewImageUrl = this.imageUrlsDictionary[mobileLanguage];
    } else {
      this.contentPreviewImageUrl = null;
    }

    this.contentPreviewTitle = titleControl.value;
    this.contentPreviewDescription = descriptionControl.value;

    if (this.subscriptionsContentPreview.length) {
      this.subscriptionsContentPreview.forEach((subscription) => subscription.unsubscribe());
    }

    this.subscriptionsContentPreview = [
      titleControl.valueChanges.subscribe((value) => {
        this.contentPreviewTitle = value;
      }),
      descriptionControl.valueChanges.subscribe((value) => {
        this.contentPreviewDescription = value;
      }),
    ];
  }

  // #endregion

  onSubmit() {
    if (!this.hasEditPermission) {
      return;
    }

    markFormControlAsTouched(this.voucherCampaignForm);

    if (!this.voucherCampaignForm.valid) {
      this.snackBar.open(this.translates.fillRequiredFieldsMessage, this.translateService.translates.CloseSnackbarBtnText, {
        duration: 5000,
      });
      return;
    }

    const campaign = this.voucherCampaignForm.getRawValue() as SmartVoucherCampaign;
    PartnersContainer.HandlePartnersBeforeSaving(campaign);

    if (this.voucherCampaign && this.voucherCampaign.State !== SmartVoucherCampaignState.Deleted) {
      campaign.State = this.voucherCampaignForm.get(this.voucherCampaignFormProps.IsPublished).value
        ? SmartVoucherCampaignState.Published
        : SmartVoucherCampaignState.Draft;
    }

    this.submitSuccess.emit(campaign);
  }
}
