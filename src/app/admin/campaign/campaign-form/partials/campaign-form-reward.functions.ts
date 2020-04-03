import {CampaignFormComponent} from '../campaign-form.component';
import {RewardType} from '../../models/reward-type.enum';
import {CompletionType} from '../../models/completion-type.enum';
import {Validators, FormArray} from '@angular/forms';
import {IntegerValidator} from 'src/app/shared/utils/validators';
import {ratioFormProps} from './campaign-form-properties.constants';
import {defaultPercentageMoreZeroValidators, defaultPercentageZeroValidators} from 'src/app/shared/utils/predefined-validators';
import {SumOfConditionRewardRatios} from './campaign-form-reward-validators.functions';

export function getConditionRewardRatio(this: CampaignFormComponent, conditionIndex: number) {
  const conditionControl = this.conditionsFormArray.at(conditionIndex);
  const rewardRationControl = conditionControl.get(this.conditionFormProps.RewardRatio);

  return rewardRationControl;
}

export function getConditionRewardHasRatio(this: CampaignFormComponent, conditionIndex: number) {
  const conditionControl = this.conditionsFormArray.at(conditionIndex);
  const rewardHasRatioControl = conditionControl.get(this.conditionFormProps.RewardHasRatio);

  return rewardHasRatioControl;
}

export function getConditionRatiosFormArray(this: CampaignFormComponent, conditionIndex: number) {
  const ratiosFormArray = this.getConditionRewardRatio(conditionIndex).get(this.ratioFormProps.Ratios) as FormArray;

  return ratiosFormArray;
}

export function getSumOfConditionRewardRatios(this: CampaignFormComponent, conditionIndex: number, propertyName: string) {
  const ratiosFormArray = this.getConditionRatiosFormArray(conditionIndex);

  return SumOfConditionRewardRatios(propertyName, ratiosFormArray);
}

/* hide for now
export function isRewardTypeOfConversionRateOptionDisabled(this: CampaignFormComponent, rewardType: string, conditionIndex: number) {
  if (rewardType !== RewardType.ConversionRate) {
    return false;
  }

  if (this.bonusTypes && this.bonusTypes.length) {
    let allowConversionRate = false;

    const conditionControl = this.conditionsFormArray.at(conditionIndex);

    const bonusTypeControl = conditionControl.get(this.conditionFormProps.Type);
    const bonusType = this.bonusTypesDict[bonusTypeControl.value];

    if (bonusType && bonusType.AllowConversionRate) {
      allowConversionRate = true;
    }

    return !allowConversionRate;
  }

  return false;
}
*/

export function isRewardTypeOfPercentageOptionDisabled(this: CampaignFormComponent, rewardType: string, conditionIndex: number) {
  if (rewardType !== RewardType.Percentage) {
    return false;
  }

  if (this.bonusTypes && this.bonusTypes.length) {
    let allowPercentage = false;

    const conditionControl = this.conditionsFormArray.at(conditionIndex);

    const bonusTypeControl = conditionControl.get(this.conditionFormProps.Type);
    const bonusType = this.bonusTypesDict[bonusTypeControl.value];

    if (bonusType && bonusType.AllowPercentage) {
      allowPercentage = true;
    }

    return !allowPercentage;
  }

  return false;
}

export function addConditionRatio(this: CampaignFormComponent, conditionIndex: number) {
  this.getConditionRatiosFormArray(conditionIndex).push(this.generateRatioFormGroup());
}

export function removeConditionRatio(this: CampaignFormComponent, conditionIndex: number, ratioIndex: number) {
  this.getConditionRatiosFormArray(conditionIndex).removeAt(ratioIndex);
}

export function clearConditionRatios(this: CampaignFormComponent, conditionIndex: number) {
  while (this.getConditionRatiosFormArray(conditionIndex).controls.length > 0) {
    this.getConditionRatiosFormArray(conditionIndex).removeAt(this.getConditionRatiosFormArray(conditionIndex).controls.length - 1);
  }
}

export function generateRatioFormGroup(this: CampaignFormComponent) {
  return this.fb.group({
    [ratioFormProps.PaymentRatio]: [null, defaultPercentageMoreZeroValidators],
    [ratioFormProps.RewardRatio]: [null, defaultPercentageZeroValidators]
  });
}

export function onCompletionTypeChanged(this: CampaignFormComponent, completionType: CompletionType) {
  const compleationCount = completionType === CompletionType.Once ? 1 : null;
  this.campaignForm.get(this.campaignFormProps.CompletionCount).setValue(compleationCount);
}

export function isCompletionCountAllowed(this: CampaignFormComponent) {
  return this.campaignForm.get(this.campaignFormProps.CompletionType).value === CompletionType.Multiple;
}

// protected
export function updateCompletionCountValidators(this: CampaignFormComponent) {
  const completionCountControl = this.campaignForm.get(this.campaignFormProps.CompletionCount);
  const completionTypeControl = this.campaignForm.get(this.campaignFormProps.CompletionType);

  if (completionTypeControl.value === CompletionType.Multiple) {
    completionCountControl.setValidators([Validators.required, IntegerValidator, Validators.min(1)]);
  } else if (completionTypeControl.value === CompletionType.Once) {
    completionCountControl.setValidators([Validators.required, IntegerValidator]);
  } else {
    completionCountControl.setValidators(null);
  }
  completionCountControl.updateValueAndValidity();
}
