import {markFormControlAsTouched} from 'src/app/shared/utils/markFormControlAsTouched';
import {CampaignFormComponent} from '../campaign-form.component';
import {CampaignStatus} from '../../models/campaign-status.enum';
import {RewardType} from '../../models/reward-type.enum';
import {IConditionSubscriptionsHolder} from '../../models/condition-subscriptions-holder.interface';
import {AbstractControl} from '@angular/forms';
import {defaultTokenZeroValidators} from 'src/app/shared/utils/predefined-validators';

export function getConditionVertical(this: CampaignFormComponent, index: number) {
  const bonusTypeControl = this.conditionsFormArray.at(index).get(this.conditionFormProps.Type);
  return this.getConditionVerticalByBonusType(bonusTypeControl.value);
}

export function hasConditionVertical(this: CampaignFormComponent, index: number) {
  return !!this.getConditionVertical(index);
}

export function allowDeleteCondition(this: CampaignFormComponent): boolean {
  return !this.campaign || this.campaign.Status === CampaignStatus.Pending;
}

export function addCondition(this: CampaignFormComponent) {
  markFormControlAsTouched(this.conditionsFormArray);

  // start checking from the second condition because adding available only for special first condition
  if (this.conditionsFormArray.controls.length > 1) {
    for (let i = 1, l = this.conditionsFormArray.controls.length; i < l; i++) {
      const c = this.conditionsFormArray.controls[i];

      if (c.invalid) {
        return;
      }
    }
  }

  // allow zero for fixed reward when we add optional condition
  if (this.conditionsFormArray.controls.length === 1) {
    const rewardControl = this.campaignForm.get(this.campaignFormProps.Reward);
    rewardControl.setValidators(defaultTokenZeroValidators);
    rewardControl.updateValueAndValidity();
  }

  this.conditionsFormArray.push(this.generateConditionFormGroup(/*isFirstCondition*/ false));
  this.updateRewardValidators(/*isInitialization*/ false, this.conditionsFormArray.controls.length - 1);
  // add subscriptions
  // hide ConversionRate for now: this.addConditionRateSubscription(this.conditionsFormArray.controls.length - 1);
  this.addConditionRewardTypeSubscription(this.conditionsFormArray.controls.length - 1);
}

export function removeCondition(this: CampaignFormComponent, index: number) {
  removeSubscriptionsFromCondition(this.conditionsFormArray.at(index));
  this.conditionsFormArray.removeAt(index);

  // not allow zero for fixed reward when we remove all optional conditions
  if (this.conditionsFormArray.controls.length === 1) {
    const rewardControl = this.campaignForm.get(this.campaignFormProps.Reward);
    rewardControl.setValidators(defaultTokenZeroValidators);
    rewardControl.updateValueAndValidity();
  }
}

export function isEnabledConditionFixed(this: CampaignFormComponent, index: number) {
  return this.conditionsFormArray.at(index).get(this.conditionFormProps.RewardType).value === RewardType.Fixed;
}

export function isEnabledConditionPercentage(this: CampaignFormComponent, index: number) {
  return this.conditionsFormArray.at(index).get(this.conditionFormProps.RewardType).value === RewardType.Percentage;
}

export function isApproximateCondition(this: CampaignFormComponent, index: number) {
  var rewardType = this.conditionsFormArray.at(index).get(this.conditionFormProps.RewardType);
  return rewardType.value === RewardType.Percentage || rewardType.value === RewardType.ConversionRate;
}

export function isEnabledConditionConversionRate(this: CampaignFormComponent, index: number) {
  return this.conditionsFormArray.at(index).get(this.conditionFormProps.RewardType).value === RewardType.ConversionRate;
}

// protected
export function getConditionVerticalByBonusType(this: CampaignFormComponent, bonusTypeValue: string) {
  const bonusType = this.bonusTypesDict[bonusTypeValue];

  return bonusType ? bonusType.Vertical : null;
}

export function addConditionRewardTypeSubscription(this: CampaignFormComponent, conditionIndex: number) {
  const conditionControl = this.conditionsFormArray.at(conditionIndex);

  if (!conditionControl) {
    return;
  }

  ((conditionControl as any) as IConditionSubscriptionsHolder).RewardTypeSubscription = conditionControl
    .get(this.conditionFormProps.RewardType)
    .valueChanges.subscribe(() => {
      this.updateRewardValidators(/*isInitialization*/ false, conditionIndex);
    });
}

export function addConditionRateSubscription(this: CampaignFormComponent, conditionIndex: number) {
  const conditionControl = this.conditionsFormArray.at(conditionIndex);

  if (!conditionControl) {
    return;
  }

  ((conditionControl as any) as IConditionSubscriptionsHolder).UseRateSubscription = conditionControl
    .get(this.conditionFormProps.UsePartnerCurrencyRate)
    .valueChanges.subscribe(value => {
      if (value) {
        this.setPartnerOrGlobalRate(this.getAllPartnerIds(), conditionIndex);
      } else {
        this.toggleDisablingOfRateFields(false, conditionIndex);
      }
    });
}

export function removeSubscriptionsFromAllConditions(this: CampaignFormComponent) {
  this.conditionsFormArray.controls.forEach(condition => {
    removeSubscriptionsFromCondition(condition);
  });
}

function removeSubscriptionsFromCondition(condition: AbstractControl) {
  if (!condition) {
    return;
  }

  const subscriptions = (condition as any) as IConditionSubscriptionsHolder;

  if (subscriptions.RewardTypeSubscription) {
    subscriptions.RewardTypeSubscription.unsubscribe();
  }

  if (subscriptions.UseRateSubscription) {
    subscriptions.UseRateSubscription.unsubscribe();
  }

  if (subscriptions.StakingPeriodSubscription) {
    subscriptions.StakingPeriodSubscription.unsubscribe();
  }
}
