import {CampaignFormComponent} from '../campaign-form.component';
import {RewardType} from '../../models/reward-type.enum';
import {CompletionType} from '../../models/completion-type.enum';
import {BonusTypeExtended} from '../../models/bonus-type-extended.interface';
import {RewardRatioAttribute} from '../../models/reward-ratio-attribute.interface';
import {RatioAttribute} from '../../models/ratio-attribute.interface';
import {Campaign} from '../../models/campaign.interface';

export function onInit(this: CampaignFormComponent): void {
  // translates
  this.translates.rewardTypeFixedText = this.rewardTypeFixedText.nativeElement.innerText;
  this.translates.rewardTypeConversionRateText = this.rewardTypeConversionRateText.nativeElement.innerText;
  this.translates.rewardTypePercentageText = this.rewardTypePercentageText.nativeElement.innerText;
  this.translates.completionTypeUnlimitedText = this.completionTypeUnlimitedText.nativeElement.innerText;
  this.translates.completionTypeOnceText = this.completionTypeOnceText.nativeElement.innerText;
  this.translates.completionTypeMultipleText = this.completionTypeMultipleText.nativeElement.innerText;

  // partners
  this.businessVerticalDisplayNamesDict = this.businessVerticalService.getBusinessVerticalItems().reduce((obj, item) => {
    obj[item.Type] = item.DisplayName;
    return obj;
  }, {} as {[key: string]: string});

  // rewards
  this.rewardTypes = [
    {Type: RewardType.Fixed, DisplayName: this.translates.rewardTypeFixedText},
    // hide for now - {Type: RewardType.ConversionRate, DisplayName: this.translates.rewardTypePercentageText},
    {Type: RewardType.Percentage, DisplayName: this.translates.rewardTypePercentageText}
  ];

  // completion types
  this.completionTypes = [
    {Type: CompletionType.Unlimited, DisplayName: this.translates.completionTypeUnlimitedText},
    {Type: CompletionType.Once, DisplayName: this.translates.completionTypeOnceText},
    {Type: CompletionType.Multiple, DisplayName: this.translates.completionTypeMultipleText}
  ];

  if (this.campaign) {
    if (this.campaign.CompletionCount === 1) {
      this.campaign.CompletionType = CompletionType.Once;
    } else if (this.campaign.CompletionCount > 1) {
      this.campaign.CompletionType = CompletionType.Multiple;
    } else {
      this.campaign.CompletionType = CompletionType.Unlimited;
    }

    this.campaign.Conditions.forEach((_, ci) => {
      this.conditionsFormArray.push(this.generateConditionFormGroup(/*isFirstCondition*/ ci === 0));

      if (
        this.campaign.Conditions[ci].RewardHasRatio &&
        this.campaign.Conditions[ci].RewardRatio &&
        this.campaign.Conditions[ci].RewardRatio.Ratios
      ) {
        this.campaign.Conditions[ci].RewardRatio.Ratios.forEach(() => {
          this.getConditionRatiosFormArray(ci).push(this.generateRatioFormGroup());
        });
      } else {
        // Atherwise we have an error when the ratio is null
        let ratios: RatioAttribute[] = [];
        let ratio: RewardRatioAttribute = {
          Ratios: ratios
        };

        this.campaign.Conditions[ci].RewardRatio = ratio;
      }
    });

    //#region mobile content related
    this.campaign.MobileContents.forEach(mobContent => {
      this.mobileContentsFormArray.push(this.generateMobileContentFormGroup(mobContent.MobileLanguage, !!mobContent.ImageId));

      // store image urls
      if (mobContent && mobContent.Image) {
        this.imageUrlsDictionary[mobContent.MobileLanguage] = mobContent.Image.ImageBlobUrl;
      }
    });
    //#endregion

    Campaign.HandleSingleConditionCaseForEditRepresentation(this.campaign);

    this.campaignForm.reset(this.campaign);

    // reward
    this.updateRewardValidators(true);
    if (this.conditionsFormArray.controls.length > 1) {
      this.conditionsFormArray.controls.forEach((_, index) => {
        this.updateRewardValidators(true, index);
      });
    }

    this.updateCompletionCountValidators();

    for (let i = 0; i < this.campaign.Conditions.length; i++) {
      this.updateConditionStakingValidators(this.conditionsFormArray.at(i), /*isInitialization*/ true);
    }

    this.disableFormControlsByStatus(this.campaign.Status);

    if (!this.hasEditPermission) {
      this.campaignForm.disable();
    }
  } else {
    this.conditionsFormArray.push(this.generateConditionFormGroup(/*isFirstCondition*/ true));

    //#region mobile content related
    this.availableMobileLanguages = this.dictionaryService.getMobileLanguages();
    this.availableMobileLanguages.forEach(language => {
      this.mobileContentsFormArray.push(this.generateMobileContentFormGroup(language));
    });
    //#endregion
  }

  if (this.conditionsFormArray.controls.length > 1) {
    this.conditionsFormArray.controls.forEach((_, index) => {
      if (index === 0) {
        return;
      }

      /* hide ConversionRate for now
      this.toggleDisablingOfRateFields(true, index);

      // enable manual rates
      if (
        this.campaign &&
        this.conditionsFormArray.enabled &&
        !this.conditionsFormArray.at(index).get(this.conditionFormProps.UsePartnerCurrencyRate).value
      ) {
        this.toggleDisablingOfRateFields(false, index);
      }

      this.addConditionRateSubscription(index);
      */
      this.addConditionRewardTypeSubscription(index);
    });
  }

  this.subscriptions = [
    this.campaignForm.get(this.campaignFormProps.CompletionType).valueChanges.subscribe(value => {
      this.onCompletionTypeChanged(value);
    }),
    this.campaignForm.get(this.campaignFormProps.RewardType).valueChanges.subscribe(() => {
      this.updateRewardValidators(false);
    }),
    /* hide ConversionRate for now
    this.campaignForm.get(this.campaignFormProps.UsePartnerCurrencyRate).valueChanges.subscribe(value => {
      if (value) {
        this.setPartnerOrGlobalRate(this.getAllPartnerIds());
      } else {
        this.toggleDisablingOfRateFields(false);
      }
    }),
    */
    this.campaignForm.get(this.campaignFormProps.CompletionType).valueChanges.subscribe(() => {
      this.updateCompletionCountValidators();
    }),
    this.campaignService.getBonusTypes().subscribe(bonusTypes => {
      this.bonusTypes = bonusTypes.map(x => {
        const extended = x as BonusTypeExtended;
        const splitted = x.DisplayName.split(':');

        if (splitted.length === 2) {
          extended.DisplayText = splitted[1].trim();
          extended.DisplayTag = splitted[0];
        } else {
          extended.DisplayText = x.DisplayName;
        }

        return extended;
      });

      this.bonusTypesMandatory = this.bonusTypes.filter(x => x.IsHidden === false);
      this.bonusTypesOptional = this.bonusTypes.filter(x => x.IsHidden === true);

      this.bonusTypesDict = this.bonusTypes.reduce((obj, item) => {
        obj[item.Type] = item;
        return obj;
      }, {} as {[key: string]: BonusTypeExtended});

      this.isLoadingBonusTypes = false;

      if (this.campaign) {
        if (this.conditionsFormArray.enabled) {
          this.campaign.Conditions.forEach((_, index) => {
            const bonusType = this.getBonusTypeByConditionIndex(index);
            this.updateConditionHasStaking(bonusType, index);

            // check partner availability
            if (index === 0) {
              const partnersControl = this.conditionsFormArray.at(index).get(this.conditionFormProps.PartnerId);
              this.checkPartnerAvailability(bonusType, partnersControl);
            }
          });
        }
      }
    }),
    this.rateDependencyLoadedEventEmitter.subscribe(() => {
      // check that all necessary dependencies have loaded and then continue with logic
      if (this.globalRate && !this.isLoadingPartners) {
        this.isLoadingRate = false;

        if (this.campaign) {
          if (this.conditionsFormArray.enabled) {
            this.conditionsFormArray
              .at(0)
              .get(this.conditionFormProps.PartnerId)
              .enable();
          }
          // hide ConversionRate for now: this.setPartnerOrGlobalRate(this.getAllPartnerIds());
        } else {
          this.setToGlobalRate();
        }

        this.conditionsFormArray.controls.forEach((_, index) => {
          if (index === 0) {
            return;
          }

          if (this.campaign) {
            // hide ConversionRate for now: this.setPartnerOrGlobalRate(this.getAllPartnerIds(), index);
          } else {
            this.setToGlobalRate(index);
          }
        });
      }
    })
  ];

  // load partners because there is vertical in most bonus types
  // so it is better to have partners beforehand to be more user friendly
  this.loadAllPartners();

  // enable manual rate otherwise disable
  if (this.campaign && this.campaignForm.get(this.campaignFormProps.RewardType).enabled && !this.usePartnerCurrencyRate) {
    this.toggleDisablingOfRateFields(false);
  } else {
    this.toggleDisablingOfRateFields(true);
  }

  // hide ConversionRate for now: this.loadRate();

  // mobile content related
  this.updateContentPreviewBindings(0);
}
