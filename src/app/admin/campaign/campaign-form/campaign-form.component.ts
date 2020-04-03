import {Component, EventEmitter, Input, OnInit, Output, OnDestroy, LOCALE_ID, Inject, ViewChild, ElementRef} from '@angular/core';
import {FormArray, FormBuilder, AbstractControl, FormGroup} from '@angular/forms';
import {CampaignService} from '../campaign.service';
import {markFormControlAsTouched} from '../../../shared/utils/markFormControlAsTouched';
import {CampaignFormType} from './campaign-form-type.enum';
import {RewardType} from '../models/reward-type.enum';
import {RewardTypeItem} from '../models/reward-type-item.interface';
import {CompletionTypeItem} from '../models/completion-type-item.interface';
import {BonusTypeExtended} from '../models/bonus-type-extended.interface';
import {Campaign} from '../models/campaign.interface';
import {CampaignStatus} from '../models/campaign-status.enum';
import {Subscription} from 'rxjs';
import {MobileLanguage} from 'src/app/shared/models/mobile-language.enum';
import {MatSnackBar} from '@angular/material';
import {DictionaryService} from 'src/app/shared/services/dictionary.service';
import {BusinessVerticalService} from '../../partners/services/business-vertical.service';
import {PartnerRowResponse} from '../../partners/models/partner-row.interface';
import * as constants from 'src/app/core/constants/const';
import {PartnersService} from '../../partners/partners.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {GlobalSettingsService} from '../../global-settings/services/global-settings.service';
import {GlobalRate} from '../../global-settings/models/global-rate.interface';
import {disableFormControlsByStatus} from './partials/campaign-form-disable.functions';
import {campaignFormProps, conditionFormProps, mobileContentFormProps, ratioFormProps} from './partials/campaign-form-properties.constants';
import {onInit as init} from './partials/campaign-form-init.functions';
import {updateRewardValidators} from './partials/campaign-form-reward-validators.functions';
import * as conversionRate from './partials/campaign-form-conversion-rate.functions';
import * as partners from './partials/campaign-form-partners.functions';
import {generateCampaignFormGroup, generateConditionFormGroup} from './partials/campaign-form-generate-form-group.functions';
import {MobileContents} from '../../action-rule/models/mobile-contents.interface';
import {isBonusTypeOptionDisabled, onBonusTypeChanged, getBonusTypeByConditionIndex} from './partials/campaign-form-bonus-types.functions';
import * as reward from './partials/campaign-form-reward.functions';
import * as conditions from './partials/campaign-form-conditions.functions';
import * as mobileContents from './partials/campaign-form-mobile-contents.functions';
import {CampaignCondition} from '../models/campaign-condition.interface';
import {
  onConditionHasStakingChanged,
  updateConditionStakingValidators,
  updateConditionHasStaking
} from './partials/campaign-form-staking.functions';
import {BONUS_TYPES} from '../models/bonus-type-constants';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent implements OnInit, OnDestroy, MobileContents {
  @Input()
  type: CampaignFormType = CampaignFormType.CREATE;
  @Input()
  isSaving: boolean;
  @Output()
  submitSuccess: EventEmitter<Campaign> = new EventEmitter<Campaign>();
  @Input()
  campaign: Campaign;
  orderValues: number[];
  constructor(
    private authenticationService: AuthenticationService,
    protected businessVerticalService: BusinessVerticalService,
    protected campaignService: CampaignService,
    protected dictionaryService: DictionaryService,
    protected fb: FormBuilder,
    protected globalSettingsService: GlobalSettingsService,
    protected partnersService: PartnersService,
    protected snackBar: MatSnackBar,
    protected translateService: TranslateService,
    protected settingsService: SettingsService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ActionRules].Edit;
    this.isEnglish = this.locale.startsWith('en');
    this.templates = this.translateService.templates;
    this.campaignForm = this.generateCampaignFormGroup();
    this.MobileAppImageFileSizeInKB = this.settingsService.MobileAppImageFileSizeInKB;
    this.MobileAppImageMinWidth = this.settingsService.MobileAppImageMinWidth;
    this.MobileAppImageMinHeight = this.settingsService.MobileAppImageMinHeight;

    this.orderValues = Array.from({length: 100}, (_v, k) => k + 1);
  }
  get minStartDate(): any {
    return this.type === CampaignFormType.CREATE ? new Date() : null;
  }
  get minEndDate(): any {
    return this.campaignForm.get(this.campaignFormProps.FromDate).value;
  }
  get conditionsFormArray(): FormArray {
    return this.campaignForm.get(this.campaignFormProps.Conditions) as FormArray;
  }
  get isEnabledOptionalConditions(): boolean {
    return this.conditionsFormArray.at(0).get(this.conditionFormProps.Type).value === BONUS_TYPES.ESTATE_LEAD_REFERRAL;
  }
  get isEnabledCampaignFormControl(): AbstractControl {
    return this.campaignForm.get(this.campaignFormProps.IsEnabled);
  }
  get isFixedRewardType(): boolean {
    return this.campaignForm.get(this.campaignFormProps.RewardType).value === RewardType.Fixed;
  }

  get isApproximate(): boolean {
    var rewardType = this.campaignForm.get(this.campaignFormProps.RewardType);
    return rewardType.value === RewardType.Percentage || rewardType.value === RewardType.ConversionRate;
  }

  get isPercentageRewardType(): boolean {
    return this.campaignForm.get(this.campaignFormProps.RewardType).value === RewardType.Percentage;
  }
  /* hide ConversionRate for now
  get isConversionRateRewardType(): boolean {
    return this.campaignForm.get(this.campaignFormProps.RewardType).value === RewardType.ConversionRate;
  }
  */
  get usePartnerCurrencyRate(): boolean {
    return this.campaignForm.get(this.campaignFormProps.UsePartnerCurrencyRate).value;
  }
  protected get tokensControl(): AbstractControl {
    return this.campaignForm.get(this.campaignFormProps.AmountInTokens);
  }
  protected get currencyControl(): AbstractControl {
    return this.campaignForm.get(this.campaignFormProps.AmountInCurrency);
  }
  get mobileContentsFormArray(): FormArray {
    return this.campaignForm.get(this.campaignFormProps.MobileContents) as FormArray;
  }
  get mobileContentsEnglishOnly(): AbstractControl[] {
    return this.mobileContentsFormArray.controls
      ? this.mobileContentsFormArray.controls.filter(x => x.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En)
      : this.mobileContentsFormArray.controls;
  }
  previousPage = '';
  previousPageSize = '';
  component = this;
  tokenSymbol = constants.TOKEN_SYMBOL;
  CURRENCY_INPUT_ACCURACY = constants.CURRENCY_INPUT_ACCURACY;
  CURRENCY_INPUT_MAX_NUMBER = constants.CURRENCY_INPUT_MAX_NUMBER;
  CURRENCY_INPUT_MIN_NUMBER = constants.CURRENCY_INPUT_MIN_NUMBER;
  INTEGER_MAX_NUMBER = constants.INTEGER_MAX_NUMBER;
  PERCENTAGE_INPUT_ACCURACY = constants.PERCENTAGE_INPUT_ACCURACY;
  PERCENTAGE_INPUT_MIN_NUMBER = constants.PERCENTAGE_INPUT_MIN_NUMBER;
  TOKENS_INPUT_ACCURACY = constants.TOKENS_INPUT_ACCURACY;
  TOKENS_INPUT_MAX_NUMBER = constants.TOKENS_INPUT_MAX_NUMBER;
  isLoadingBonusTypes = true;
  bonusTypes: BonusTypeExtended[];
  bonusTypesMandatory: BonusTypeExtended[];
  bonusTypesOptional: BonusTypeExtended[];
  bonusTypesDict: {[key: string]: BonusTypeExtended} = {};
  get bonusTypeHint() {
    let hint = '';

    if (this.conditionsFormArray) {
      const bonusTypeValue = this.conditionsFormArray.at(0).get(this.conditionFormProps.Type).value;

      if (bonusTypeValue) {
        switch (bonusTypeValue) {
          case BONUS_TYPES.SIGNUP:
            hint = 'New customer of the program is awarded when joining';
            break;
          case BONUS_TYPES.FRIEND_REFERRAL:
            hint = 'Customer of the program is awarded when his/her friend joins the program';
            break;
          case BONUS_TYPES.ESTATE_LEAD_REFERRAL:
            hint = 'Connector is awarded when a lead referred by him/her is approved';
            break;
          case BONUS_TYPES.PROPERTY_PURCHASE_COMMISSION_ONE:
            hint = 'Purchaser is awarded when purchasing a property';
            break;
          case BONUS_TYPES.HOTEL_STAY_REFERRAL:
            hint = 'Customer of the program is awarded when a person referred by him/her stays in a hotel participating in the program';
            break;
          case BONUS_TYPES.HOTEL_STAY:
            hint = 'Customer of the program is awarded for staying in a hotel participating in the program';
            break;
        }
      }
    }

    return hint;
  }
  rewardTypes: RewardTypeItem[];
  completionTypes: CompletionTypeItem[];
  // partners
  businessVerticalDisplayNamesDict: {[key: string]: string};
  isLoadingPartners: boolean;
  partners: PartnerRowResponse[] = [];
  // conversion rate
  globalRate: GlobalRate;
  isLoadingRate = true;
  // bindable fields  - mobile content related
  contentPreviewTitle: string;
  contentPreviewDescription: string;
  contentPreviewImageUrl: string;
  mobileLanguages = MobileLanguage;
  availableMobileLanguages: MobileLanguage[] = [];
  // form props
  campaignFormProps = campaignFormProps;
  conditionFormProps = conditionFormProps;
  ratioFormProps = ratioFormProps;
  mobileContentFormProps = mobileContentFormProps;
  // private
  protected subscriptions: Subscription[] = [];
  protected rateDependencyLoadedEventEmitter = new EventEmitter();
  protected emptyPartnerIdValue: string = null;
  // private - mobile content related
  protected isEnglish: boolean;
  protected subscriptionsContentPreview: Subscription[] = [];
  protected isTitleCopied: boolean;
  protected isDescriptionCopied: boolean;
  protected imageUrlsDictionary: {[language: string]: string} = {};
  // #region translates
  @ViewChild('rewardTypeFixedText')
  rewardTypeFixedText: ElementRef<HTMLElement>;
  @ViewChild('rewardTypeConversionRateText')
  rewardTypeConversionRateText: ElementRef<HTMLElement>;
  @ViewChild('rewardTypePercentageText')
  rewardTypePercentageText: ElementRef<HTMLElement>;
  @ViewChild('completionTypeUnlimitedText')
  completionTypeUnlimitedText: ElementRef<HTMLElement>;
  @ViewChild('completionTypeOnceText')
  completionTypeOnceText: ElementRef<HTMLElement>;
  @ViewChild('completionTypeMultipleText')
  completionTypeMultipleText: ElementRef<HTMLElement>;
  translates = {
    rewardTypeFixedText: '',
    rewardTypeConversionRateText: '',
    rewardTypePercentageText: '',
    completionTypeUnlimitedText: '',
    completionTypeOnceText: '',
    completionTypeMultipleText: ''
  };
  templates: GlobalTemplates;
  // #endregion
  CampaignFormType = CampaignFormType;
  campaignForm: FormGroup;
  // functions
  // bonus types
  isBonusTypeOptionDisabled = isBonusTypeOptionDisabled;
  getBonusTypeByConditionIndex = getBonusTypeByConditionIndex;
  onBonusTypeChanged = onBonusTypeChanged;
  // conditions
  getConditionVertical = conditions.getConditionVertical;
  hasConditionVertical = conditions.hasConditionVertical;
  addCondition = conditions.addCondition;
  removeCondition = conditions.removeCondition;
  isEnabledConditionFixed = conditions.isEnabledConditionFixed;
  isEnabledConditionPercentage = conditions.isEnabledConditionPercentage;
  isConditionApproximate = conditions.isApproximateCondition;

  // hide for now: isEnabledConditionConversionRate = conditions.isEnabledConditionConversionRate;
  protected getConditionVerticalByBonusType = conditions.getConditionVerticalByBonusType;
  protected addConditionRewardTypeSubscription = conditions.addConditionRewardTypeSubscription;
  // hide for now: protected addConditionRateSubscription = conditions.addConditionRateSubscription;
  protected removeConditionSubscriptions = conditions.removeSubscriptionsFromAllConditions;
  // staking
  updateConditionHasStaking = updateConditionHasStaking;
  onConditionHasStakingChanged = onConditionHasStakingChanged;
  protected updateConditionStakingValidators = updateConditionStakingValidators;
  // conversion rate
  // hide for now: protected loadRate = conversionRate.loadRate;
  protected setPartnerOrGlobalRate = conversionRate.setPartnerOrGlobalRate;
  protected setToGlobalRate = conversionRate.setToGlobalRate;
  protected toggleDisablingOfRateFields = conversionRate.toggleDisablingOfRateFields;
  // disable
  protected disableFormControlsByStatus = disableFormControlsByStatus;
  // generate
  protected generateCampaignFormGroup = generateCampaignFormGroup;
  protected generateConditionFormGroup = generateConditionFormGroup;
  protected generateRatioFormGroup = reward.generateRatioFormGroup;
  // mobile content related
  MobileAppImageFileSizeInKB: number;
  MobileAppImageMinWidth: number;
  MobileAppImageMinHeight: number;
  onNameBlur = mobileContents.onNameBlur;
  onDescriptionBlur = mobileContents.onDescriptionBlur;
  addFiles = mobileContents.addFiles;
  selectedTabIndexChange = mobileContents.selectedTabIndexChange;
  getAcceptFilesExtensions = mobileContents.getAcceptFilesExtensions;
  protected generateMobileContentFormGroup = mobileContents.generateMobileContentFormGroup;
  protected updateContentPreviewBindings = mobileContents.updateContentPreviewBindings;
  protected updateContentPreviewImageUrl = mobileContents.updateContentPreviewImageUrl;
  // partners
  partnersChanged = partners.partnersChanged;
  protected getAllPartnerIds = partners.getAllPartnerIds;
  protected loadAllPartners = partners.loadAllPartners;
  protected loadPagedPartners = partners.loadPagedPartners;
  protected checkPartnerAvailability = partners.checkPartnerAvailability;
  // reward validators
  protected updateRewardValidators = updateRewardValidators;
  // reward
  getConditionRewardRatio = reward.getConditionRewardRatio;
  getConditionRewardHasRatio = reward.getConditionRewardHasRatio;
  getConditionRatiosFormArray = reward.getConditionRatiosFormArray;
  getSumOfConditionRewardRatios = reward.getSumOfConditionRewardRatios;
  addConditionRatio = reward.addConditionRatio;
  removeConditionRatio = reward.removeConditionRatio;
  clearConditionRatios = reward.clearConditionRatios;
  // hide for now: isRewardTypeOfConversionRateOptionDisabled = reward.isRewardTypeOfConversionRateOptionDisabled;
  isRewardTypeOfPercentageOptionDisabled = reward.isRewardTypeOfPercentageOptionDisabled;
  onCompletionTypeChanged = reward.onCompletionTypeChanged;
  isCompletionCountAllowed = reward.isCompletionCountAllowed;
  protected updateCompletionCountValidators = reward.updateCompletionCountValidators;
  // permissions
  hasEditPermission = false;
  // private
  private init = init;

  ngOnInit() {
    this.init();

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
  }
  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.removeConditionSubscriptions();

    // mobile content related
    this.subscriptionsContentPreview.forEach(subscription => subscription.unsubscribe());
  }
  onSubmit() {
    if (!this.hasEditPermission) {
      return;
    }

    markFormControlAsTouched(this.campaignForm);
    // log(this.campaignForm)

    if (!this.campaignForm.valid) {
      this.snackBar.open('Please check the form and fill the required fields', 'Close', {
        duration: 5000
      });
      return;
    }

    const campaign = (this.campaign && this.campaign.Status !== CampaignStatus.Pending
      ? this.campaignForm.value
      : this.campaignForm.getRawValue()) as Campaign;

    if (campaign.RewardType === RewardType.Percentage) {
      campaign.Reward = campaign.Reward.toString();
    }

    if (campaign.Conditions) {
      campaign.Conditions.forEach((condition, index) => {
        CampaignCondition.HandleStakingBeforeSaving(condition);
        CampaignCondition.HandleCompletionCountBeforeSaving(condition, index === 0);
        CampaignCondition.HandleRewardBeforeSaving(condition);
        CampaignCondition.HandleRewardRatioBeforeSaving(condition);

        // copy partner to optional conditions
        if (index > 0) {
          condition.PartnerId = campaign.Conditions[0].PartnerId;
        }

        if (condition.RewardRatio && condition.RewardRatio.Ratios) {
          condition.RewardRatio.Ratios.forEach((r, i) => {
            r.Order = i + 1;
          });
        }
      });

      Campaign.HandleSingleConditionCase(campaign);
    }

    this.submitSuccess.emit(campaign);
  }
}
