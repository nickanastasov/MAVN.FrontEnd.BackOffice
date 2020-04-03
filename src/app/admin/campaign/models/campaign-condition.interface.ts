import {RewardType} from './reward-type.enum';
import {RewardRatioAttribute} from './reward-ratio-attribute.interface';

export class CampaignCondition {
  Id: string;
  Type: string;
  DisplayName: string;
  CompletionCount: number;
  RewardType: string;
  ImmediateReward: string | number;
  AmountInTokens: string;
  AmountInCurrency: number;
  UsePartnerCurrencyRate: boolean;
  ApproximateAward: string;
  // due to changes now it is only single partner
  PartnerId: string;
  // ratio
  RewardHasRatio: boolean;
  RewardRatio: RewardRatioAttribute;
  HasStaking: boolean;
  StakeAmount?: string;
  StakingPeriod?: number;
  StakeWarningPeriod?: number;
  StakingRule?: number;
  BurningRule?: number;

  static HandleStakingBeforeSaving(model: CampaignCondition): void {
    if (!model.HasStaking) {
      model.StakeAmount = null;
      model.StakingPeriod = null;
      model.StakeWarningPeriod = null;
      model.StakingRule = null;
      model.BurningRule = null;
    }
  }

  static HandleCompletionCountBeforeSaving(model: CampaignCondition, isFirst: boolean): void {
    // for first condition set CompletionCount to 1
    // and other optional conditions are having CompletionCount equals null
    model.CompletionCount = isFirst ? 1 : null;
  }

  static HandleRewardBeforeSaving(model: CampaignCondition): void {
    if (model.RewardType === RewardType.Percentage) {
      model.ImmediateReward = model.ImmediateReward.toString();
    }
  }

  static HandleRewardRatioBeforeSaving(model: CampaignCondition): void {
    if (model.RewardRatio && model.RewardRatio.Ratios && model.RewardRatio.Ratios.length === 0) {
      model.RewardHasRatio = false;
      model.RewardRatio = null;
    }
  }
}
