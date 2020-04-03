import {CampaignFormComponent} from '../campaign-form.component';
import {
  DEFAULT_STAKE_AMOUNT,
  DEFAULT_STAKING_PERIOD,
  DEFAULT_STAKE_WARNING_PERIOD,
  DEFAULT_STAKING_RULE,
  DEFAULT_BURNING_RULE
} from './campaign-form-staking-defaults.constants';
import {defaultTokenMoreZeroValidators, defaultPercentageZeroValidators} from 'src/app/shared/utils/predefined-validators';
import {AbstractControl, Validators, ValidatorFn, ValidationErrors} from '@angular/forms';
import {IntegerValidator} from 'src/app/shared/utils/validators';
import {INTEGER_MAX_NUMBER} from 'src/app/core/constants/const';
import {BonusType} from '../../models/bonus-type.interface';
import {IConditionSubscriptionsHolder} from '../../models/condition-subscriptions-holder.interface';

export function updateConditionHasStaking(this: CampaignFormComponent, bonusType: BonusType, index: number) {
  if (bonusType) {
    const hasStakingControl = this.conditionsFormArray.at(index).get(this.conditionFormProps.HasStaking);

    if (bonusType.IsStakeable) {
      hasStakingControl.enable();
    } else {
      hasStakingControl.setValue(false);
      hasStakingControl.disable();
    }
  }
}

export function onConditionHasStakingChanged(this: CampaignFormComponent, condition: AbstractControl) {
  this.updateConditionStakingValidators(condition, /*isInitialization*/ false);
}

export function updateConditionStakingValidators(this: CampaignFormComponent, condition: AbstractControl, isInitialization: boolean) {
  const hasStakingControl = condition.get(this.conditionFormProps.HasStaking);
  const stakeAmountControl = condition.get(this.conditionFormProps.StakeAmount);
  const stakingPeriodControl = condition.get(this.conditionFormProps.StakingPeriod);
  const stakeWarningPeriodControl = condition.get(this.conditionFormProps.StakeWarningPeriod);
  const stakingRuleControl = condition.get(this.conditionFormProps.StakingRule);
  const burningRuleControl = condition.get(this.conditionFormProps.BurningRule);

  if (hasStakingControl.value) {
    stakeAmountControl.setValidators(defaultTokenMoreZeroValidators);

    stakingPeriodControl.setValidators([
      // validators
      Validators.required,
      Validators.min(1),
      Validators.max(INTEGER_MAX_NUMBER),
      IntegerValidator
    ]);

    ((condition as any) as IConditionSubscriptionsHolder).StakingPeriodSubscription = stakingPeriodControl.valueChanges.subscribe(_ => {
      stakeWarningPeriodControl.updateValueAndValidity();
    });

    stakeWarningPeriodControl.setValidators([
      // validators
      Validators.required,
      Validators.min(0),
      IntegerValidator,
      StakeWarningPeriodLessThanStakingPeriodValidator(stakingPeriodControl)
    ]);

    stakingRuleControl.setValidators(defaultPercentageZeroValidators);
    burningRuleControl.setValidators(defaultPercentageZeroValidators);

    if (!isInitialization) {
      stakeAmountControl.setValue(DEFAULT_STAKE_AMOUNT);
      stakingPeriodControl.setValue(DEFAULT_STAKING_PERIOD);
      stakeWarningPeriodControl.setValue(DEFAULT_STAKE_WARNING_PERIOD);
      stakingRuleControl.setValue(DEFAULT_STAKING_RULE);
      burningRuleControl.setValue(DEFAULT_BURNING_RULE);
    }
  } else {
    stakeAmountControl.setValidators(null);
    stakingPeriodControl.setValidators(null);
    stakeWarningPeriodControl.setValidators(null);
    stakingRuleControl.setValidators(null);
    burningRuleControl.setValidators(null);

    const subscription = ((stakingPeriodControl as any) as IConditionSubscriptionsHolder).StakingPeriodSubscription;

    if (subscription) {
      subscription.unsubscribe();
    }

    if (!isInitialization) {
      stakeAmountControl.setValue(null);
      stakingPeriodControl.setValue(null);
      stakeWarningPeriodControl.setValue(null);
      stakingRuleControl.setValue(null);
      burningRuleControl.setValue(null);
    }
  }
}

export function StakeWarningPeriodLessThanStakingPeriodValidator(stakingPeriodControl: AbstractControl): ValidatorFn {
  return (stakeWarningPeriodControl: AbstractControl): ValidationErrors | null => {
    const stakingPeriod = stakingPeriodControl.value as number;
    const stakeWarningPeriod = stakeWarningPeriodControl.value as number;

    if (!stakingPeriod || !stakeWarningPeriod) {
      return null;
    }

    return stakingPeriod > stakeWarningPeriod ? null : {shouldBeLessThanStakingPeriod: true};
  };
}
