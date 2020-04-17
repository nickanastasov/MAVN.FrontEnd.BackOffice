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
import {SmartVoucher} from '../models/smart-voucher.interface';
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
  submitSuccess: EventEmitter<SmartVoucher> = new EventEmitter<SmartVoucher>();

  @Input()
  voucher: SmartVoucher;

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
  // partners
  isLoadingPartners: boolean;
  partners: PartnerRowResponse[] = [];
  voucherFormProps = {
    Name: 'Name',
    FromDate: 'FromDate',
    ToDate: 'ToDate',
    VouchersTotalCount: 'VouchersTotalCount',
    VoucherPrice: 'VoucherPrice',
    Currency: 'Currency',
    PartnerId: 'PartnerId',
    PartnersSearch: 'PartnersSearch',
    Description: 'Description',
    MobileContents: 'MobileContents',
    IsPublished: 'IsPublished',
  };
  VouchersCount = 0;
  BoughtVouchersCount = 0;
  VouchersInStockCount = 0;
  globalRate: GlobalRate;
  isLoadingRate = true;

  // bindable fields - mobile content related
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

  // private
  private subscriptions: Subscription[] = [];
  private rateDependencyLoadedEventEmitter = new EventEmitter();
  private emptyPartnerIdValue = '';

  // private - mobile content related
  private subscriptionsContentPreview: Subscription[] = [];
  private isTitleCopied: boolean;
  private isDescriptionCopied: boolean;
  private imageUrlsDictionary: {[language: string]: string} = {};

  // #region translates
  @ViewChild('fillRequiredFieldsMessage', {static: true})
  fillRequiredFieldsMessage: ElementRef<HTMLElement>;
  private translates = {
    fillRequiredFieldsMessage: '',
  };

  templates: GlobalTemplates;
  // #endregion
  hasEditPermission = false;

  constructor(
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private dictionaryService: DictionaryService,
    private partnersService: PartnersService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ActionRules].Edit;
    this.templates = this.translateService.templates;
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.MobileAppImageFileSizeInKB = this.settingsService.MobileAppImageFileSizeInKB;
    this.MobileAppImageMinWidth = this.settingsService.MobileAppImageMinWidth;
    this.MobileAppImageMinHeight = this.settingsService.MobileAppImageMinHeight;
  }

  smartVoucherForm = this.fb.group({
    [this.voucherFormProps.Name]: [null, [Validators.required, LengthValidator(3, 50)]],
    [this.voucherFormProps.FromDate]: [null, [Validators.required]],
    [this.voucherFormProps.ToDate]: [null],
    [this.voucherFormProps.VouchersTotalCount]: [
      null,
      [
        // validators
        Validators.required,
        Validators.min(1),
        Validators.max(constants.INTEGER_MAX_NUMBER),
        IntegerValidator,
      ],
    ],
    [this.voucherFormProps.VoucherPrice]: [
      null,
      [
        // validators
        Validators.required,
        Validators.min(1),
        Validators.max(constants.INTEGER_MAX_NUMBER),
        IntegerValidator,
      ],
    ],
    [this.voucherFormProps.Currency]: [null],
    [this.voucherFormProps.PartnersSearch]: [null],
    [this.voucherFormProps.PartnerId]: [this.emptyPartnerIdValue, [Validators.required]],
    [this.voucherFormProps.Description]: [null, [LengthValidator(3, 1000)]],
    [this.voucherFormProps.MobileContents]: this.fb.array([]),
    [this.voucherFormProps.IsPublished]: [false],
  });

  get mobileContentsFormArray() {
    return this.smartVoucherForm.get(this.voucherFormProps.MobileContents) as FormArray;
  }
  get isPublishedControl(): AbstractControl {
    return this.smartVoucherForm.get(this.voucherFormProps.IsPublished);
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

    if (this.voucher) {
      if (this.voucher.PartnerId && !this.voucher.PartnerId.length) {
        this.voucher.PartnerId = this.emptyPartnerIdValue;
      }

      //#region mobile content related
      this.voucher.MobileContents.forEach((mobContent) => {
        this.mobileContentsFormArray.push(this.generateMobileContentFormGroup(mobContent.MobileLanguage, !!mobContent.ImageId));

        // store image urls
        if (mobContent && mobContent.Image) {
          this.imageUrlsDictionary[mobContent.MobileLanguage] = mobContent.Image.ImageBlobUrl;
        }
      });
      //#endregion

      this.smartVoucherForm.reset(this.voucher);
      this.smartVoucherForm.get(this.voucherFormProps.VoucherPrice).disable();

      // disable fields in order to defence from human mistake of changing VoucherPrice for already imported vouchers
      this.smartVoucherForm.get(this.voucherFormProps.VoucherPrice).disable();
      this.smartVoucherForm.get(this.voucherFormProps.VouchersTotalCount).disable();

      this.VouchersCount = this.voucher.VouchersTotalCount;
      this.BoughtVouchersCount = this.voucher.BoughtVouchersCount;
      this.VouchersInStockCount = this.VouchersCount - this.BoughtVouchersCount;

      this.smartVoucherForm.get(this.voucherFormProps.IsPublished).setValue(this.voucher.State === SmartVoucherCampaignState.Published);

      if (!this.hasEditPermission || this.voucher.State === SmartVoucherCampaignState.Deleted) {
        this.smartVoucherForm.disable();
      }
    } else {
      this.smartVoucherForm.get(this.voucherFormProps.Currency).setValue(this.baseCurrencyCode);

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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    // mobile content related
    this.subscriptionsContentPreview.forEach((subscription) => subscription.unsubscribe());
  }

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
          this.isLoadingPartners = false;
          this.rateDependencyLoadedEventEmitter.emit();
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

  // #endregion Partners

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
      const titleControl = this.smartVoucherForm.get(this.voucherFormProps.Name);

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
      const descriptionControl = this.smartVoucherForm.get(this.voucherFormProps.Description);

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

    markFormControlAsTouched(this.smartVoucherForm);

    if (!this.smartVoucherForm.valid) {
      this.snackBar.open(this.translates.fillRequiredFieldsMessage, this.translateService.translates.CloseSnackbarBtnText, {
        duration: 5000,
      });
      return;
    }

    const campaign = this.smartVoucherForm.getRawValue() as SmartVoucher;
    PartnersContainer.HandlePartnersBeforeSaving(campaign);

    if (this.voucher && this.voucher.State !== SmartVoucherCampaignState.Deleted) {
      campaign.State = this.smartVoucherForm.get(this.voucherFormProps.IsPublished).value
        ? SmartVoucherCampaignState.Published
        : SmartVoucherCampaignState.Draft;
    }

    this.submitSuccess.emit(campaign);
  }
}
