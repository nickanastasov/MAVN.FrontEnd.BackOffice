import {CampaignFormComponent} from '../campaign-form.component';
import {CampaignCondition} from '../../models/campaign-condition.interface';
import {RewardType} from '../../models/reward-type.enum';
import {BonusTypeExtended} from '../../models/bonus-type-extended.interface';

export function isBonusTypeOptionDisabled(this: CampaignFormComponent, bonusType: string) {
  return this.conditionsFormArray.value.some((condition: CampaignCondition) => condition.Type === bonusType);
}

export function getBonusTypeByConditionIndex(this: CampaignFormComponent, index: number): BonusTypeExtended {
  const bonusTypeControl = this.conditionsFormArray.at(index).get(this.conditionFormProps.Type);
  const bonusType = this.bonusTypesDict[bonusTypeControl.value];

  return bonusType;
}

export function onBonusTypeChanged(this: CampaignFormComponent, index: number) {
  const bonusType = this.getBonusTypeByConditionIndex(index);

  if (!bonusType) {
    console.error(`Perhaps at condition ${index} the bonus type is not available anymore.`);
    return;
  }

  if (index === 0 && this.conditionsFormArray.controls.length > 1 && !this.isEnabledOptionalConditions) {
    while (this.conditionsFormArray.controls.length > 1) {
      this.conditionsFormArray.removeAt(this.conditionsFormArray.controls.length - 1);
    }
  }

  /* hide for now
  if (this.isRewardTypeOfConversionRateOptionDisabled(RewardType.ConversionRate, 0)) {
    const rewardTypeControl = this.campaignForm.get(this.campaignFormProps.RewardType);

    if (rewardTypeControl.value === RewardType.ConversionRate) {
      rewardTypeControl.setValue(RewardType.Fixed);
    }
  }
  */

  if (this.isRewardTypeOfPercentageOptionDisabled(RewardType.Percentage, 0)) {
    const rewardTypeControl = this.campaignForm.get(this.campaignFormProps.RewardType);

    if (rewardTypeControl.value === RewardType.Percentage) {
      rewardTypeControl.setValue(RewardType.Fixed);
    }
  }

  // not allow zero for fixed reward
  if (index === 0 && this.conditionsFormArray.controls.length === 1) {
    this.updateRewardValidators(false);
  }

  // ratios
  const rewardHasRatioControl = this.getConditionRewardHasRatio(index);

  if (bonusType.RewardHasRatio) {
    rewardHasRatioControl.setValue(true);
  } else {
    rewardHasRatioControl.setValue(false);
    this.clearConditionRatios(index);
  }

  // #region Partners
  const partnersControl = this.conditionsFormArray.at(index).get(this.conditionFormProps.PartnerId);
  // reset Partners because can be different Vertical
  partnersControl.setValue(this.emptyPartnerIdValue);
  this.partnersChanged();
  this.checkPartnerAvailability(bonusType, partnersControl);
  // #endregion

  this.updateConditionHasStaking(bonusType, index);
}
