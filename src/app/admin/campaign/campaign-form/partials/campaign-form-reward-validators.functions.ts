import {CampaignFormComponent} from '../campaign-form.component';
import {RewardType} from '../../models/reward-type.enum';
import {
  defaultTokenMoreZeroValidators,
  defaultCurrencyMoreZeroValidators,
  defaultTokenZeroValidators,
  defaultPercentageZeroValidators
} from 'src/app/shared/utils/predefined-validators';
import {ValidatorFn, ValidationErrors, FormArray, FormGroup} from '@angular/forms';
import {PERCENTAGE_INPUT_ACCURACY} from 'src/app/core/constants/const';
import {ratioFormProps} from './campaign-form-properties.constants';

export function updateRewardValidators(this: CampaignFormComponent, isInitialization: boolean, conditionIndex = -1) {
  const rewardControl =
    conditionIndex >= 0
      ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.ImmediateReward)
      : this.campaignForm.get(this.campaignFormProps.Reward);

  const approximateAwardControl =
    conditionIndex >= 0
      ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.ApproximateAward)
      : this.campaignForm.get(this.campaignFormProps.ApproximateAward);

  const amountInTokensControl =
    conditionIndex >= 0
      ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInTokens)
      : this.campaignForm.get(this.campaignFormProps.AmountInTokens);

  const amountInCurrencyControl =
    conditionIndex >= 0
      ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInCurrency)
      : this.campaignForm.get(this.campaignFormProps.AmountInCurrency);

  const rewardTypeControl =
    conditionIndex >= 0
      ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.RewardType)
      : this.campaignForm.get(this.campaignFormProps.RewardType);

  const allowRatio = () => {
    // ratios
    if (conditionIndex >= 0) {
      const bonusType = this.getBonusTypeByConditionIndex(conditionIndex);

      if (bonusType) {
        if (bonusType.RewardHasRatio) {
          const rewardHasRatioControl = this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.RewardHasRatio);
          rewardHasRatioControl.setValue(true);
        }
      }
    }
  };

  if (rewardTypeControl.value === RewardType.Fixed) {
    if (conditionIndex < 0) {
      // check campaign reward
      rewardControl.setValidators(defaultTokenZeroValidators);
    } else if (conditionIndex > 0) {
      // skip first condition because its fields are hidden
      rewardControl.setValidators(defaultTokenZeroValidators);
    }

    amountInTokensControl.setValidators([]);
    amountInCurrencyControl.setValidators([]);
    approximateAwardControl.setValidators([]);

    if (!isInitialization) {
      rewardControl.setValue('0');
      amountInTokensControl.setValue(null);
      amountInCurrencyControl.setValue(null);
      approximateAwardControl.setValue(null);

      allowRatio();
    }
  } else if (rewardTypeControl.value === RewardType.Percentage) {
    rewardControl.setValidators(defaultPercentageZeroValidators);
    approximateAwardControl.setValidators(defaultTokenZeroValidators);
    amountInTokensControl.setValidators([]);
    amountInCurrencyControl.setValidators([]);

    if (!isInitialization) {
      rewardControl.setValue(0);
      approximateAwardControl.setValue('0');
      amountInTokensControl.setValue(null);
      amountInCurrencyControl.setValue(null);
      allowRatio();
    }
  } else if (rewardTypeControl.value === RewardType.ConversionRate) {
    rewardControl.setValidators([]);
    amountInTokensControl.setValidators(defaultTokenMoreZeroValidators);
    amountInCurrencyControl.setValidators(defaultCurrencyMoreZeroValidators);
    approximateAwardControl.setValidators(defaultTokenMoreZeroValidators);

    if (!isInitialization) {
      rewardControl.setValue('0');
      approximateAwardControl.setValue('0');
      this.campaignForm.get(this.campaignFormProps.UsePartnerCurrencyRate).setValue(true);

      // ratios
      if (conditionIndex >= 0) {
        const rewardHasRatioControl = this.getConditionRewardHasRatio(conditionIndex);

        if (rewardHasRatioControl.value) {
          rewardHasRatioControl.setValue(false);
          this.clearConditionRatios(conditionIndex);
        }
      }
    }
  } else {
    rewardControl.setValidators([]);
    approximateAwardControl.setValidators([]);
    amountInTokensControl.setValidators([]);
    amountInCurrencyControl.setValidators([]);

    if (!isInitialization) {
      rewardControl.setValue('0');
      approximateAwardControl.setValue('0');
      amountInTokensControl.setValue(null);
      amountInCurrencyControl.setValue(null);
    }
  }

  rewardControl.updateValueAndValidity();
  amountInTokensControl.updateValueAndValidity();
  amountInCurrencyControl.updateValueAndValidity();
}

export function SumOfConditionRewardRatiosValidator(propertyName: string): ValidatorFn {
  const notValid = {[propertyName]: true};

  return (control: FormGroup): ValidationErrors | null => {
    const ratiosFormArray = control.get(ratioFormProps.Ratios) as FormArray;

    if (propertyName && ratiosFormArray && ratiosFormArray.controls.length) {
      const sum = SumOfConditionRewardRatios(propertyName, ratiosFormArray);

      if (sum !== 100) {
        return notValid;
      }
    }

    return null;
  };
}

const accuracyMultiplier = Math.pow(10, PERCENTAGE_INPUT_ACCURACY);

export function SumOfConditionRewardRatios(propertyName: string, ratiosFormArray: FormArray): number {
  if (propertyName && ratiosFormArray && ratiosFormArray.controls.length) {
    let sum = 0;

    for (let i = 0, l = ratiosFormArray.controls.length; i < l; i++) {
      const c = ratiosFormArray.controls[i];

      const propertyControl = c.get(propertyName);

      sum += propertyControl.value;
    }

    // defence from float point
    sum = Math.round(sum * accuracyMultiplier) / accuracyMultiplier;

    return sum;
  }

  return 0;
}
