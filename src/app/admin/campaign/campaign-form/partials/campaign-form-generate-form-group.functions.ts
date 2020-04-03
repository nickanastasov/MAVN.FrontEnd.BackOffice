import {CampaignFormComponent} from '../campaign-form.component';
import {Validators} from '@angular/forms';
import {LengthValidator, IntegerRangeValidator, IntegerValidator} from 'src/app/shared/utils/validators';
import {defaultTokenZeroValidators} from 'src/app/shared/utils/predefined-validators';
import {RewardType} from '../../models/reward-type.enum';
import {SumOfConditionRewardRatiosValidator} from './campaign-form-reward-validators.functions';

export function generateCampaignFormGroup(this: CampaignFormComponent) {
  return this.fb.group({
    [this.campaignFormProps.Name]: [null, [Validators.required, LengthValidator(3, 50)]],
    [this.campaignFormProps.Order]: [null, [Validators.required, IntegerValidator, IntegerRangeValidator(1, 2147483647)]],
    [this.campaignFormProps.Description]: [null, [Validators.required, LengthValidator(3, 1000)]],
    [this.campaignFormProps.FromDate]: [null, Validators.required],
    [this.campaignFormProps.ToDate]: [null],
    [this.campaignFormProps.Reward]: ['0', defaultTokenZeroValidators],
    [this.campaignFormProps.AmountInTokens]: [null, []],
    [this.campaignFormProps.AmountInCurrency]: [null, []],
    [this.campaignFormProps.UsePartnerCurrencyRate]: [true],
    [this.campaignFormProps.RewardType]: [null, Validators.required],
    [this.campaignFormProps.CompletionType]: [null, Validators.required],
    [this.campaignFormProps.CompletionCount]: [null],
    [this.campaignFormProps.Conditions]: this.fb.array([]),
    [this.campaignFormProps.IsEnabled]: [true],
    [this.campaignFormProps.MobileContents]: this.fb.array([]),
    [this.campaignFormProps.ApproximateAward]: ['0', []]
  });
}

export function generateConditionFormGroup(this: CampaignFormComponent, isFirstCondition: boolean) {
  return this.fb.group({
    [this.conditionFormProps.Id]: [null, null],
    [this.conditionFormProps.Type]: [null, Validators.required],
    [this.conditionFormProps.PartnerId]: [{value: this.emptyPartnerIdValue, disabled: true}, null],
    [this.conditionFormProps.PartnersSearch]: [null],
    // reward
    [this.conditionFormProps.RewardType]: [RewardType.Fixed, Validators.required],
    [this.conditionFormProps.ImmediateReward]: ['0', isFirstCondition ? null : defaultTokenZeroValidators],
    [this.conditionFormProps.AmountInTokens]: [null, []],
    [this.conditionFormProps.AmountInCurrency]: [null, []],
    [this.conditionFormProps.UsePartnerCurrencyRate]: [true],
    [this.campaignFormProps.ApproximateAward]: ['0', []],
    // ratio
    [this.conditionFormProps.RewardHasRatio]: [false],
    [this.conditionFormProps.RewardRatio]: this.fb.group(
      {
        [this.ratioFormProps.Ratios]: this.fb.array([])
      },
      {
        validators: [
          SumOfConditionRewardRatiosValidator(this.ratioFormProps.PaymentRatio),
          SumOfConditionRewardRatiosValidator(this.ratioFormProps.RewardRatio)
        ]
      }
    ),
    // staking
    [this.conditionFormProps.HasStaking]: [{value: false, disabled: true}, null],
    [this.conditionFormProps.StakeAmount]: [null, null],
    [this.conditionFormProps.StakingPeriod]: [null, null],
    [this.conditionFormProps.StakeWarningPeriod]: [null, null],
    [this.conditionFormProps.StakingRule]: [null, null],
    [this.conditionFormProps.BurningRule]: [null, null]
  });
}
