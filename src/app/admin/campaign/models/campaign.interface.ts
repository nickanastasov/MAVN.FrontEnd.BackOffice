import {CampaignCondition} from './campaign-condition.interface';
import {CampaignStatus} from './campaign-status.enum';
import {RewardType} from './reward-type.enum';
import {CompletionType} from './completion-type.enum';
import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {BONUS_TYPES} from './bonus-type-constants';

export class Campaign {
  Id: string;
  Name: string;
  Asset: string;
  Reward: string;
  AmountInTokens: string;
  AmountInCurrency: number;
  ApproximateAward: string;
  UsePartnerCurrencyRate: boolean;
  RewardType: RewardType;
  FromDate: Date;
  ToDate: Date;
  CompletionType: CompletionType;
  CompletionCount: number;
  IsEnabled: boolean;
  Description: string;
  Status: CampaignStatus;
  Order: number;
  Conditions: CampaignCondition[];
  MobileContents: ActionRuleMobileContent[];

  /**
   * Specific case for ReferToRealEstateBonusType:
   * copy reward or conversion rate into this condition only when we have optional rewards
   * so we have infinite clause and the campaign will never be completed
   * otherwise if we don't have optional rewards then the campaign can be completed
   * so we don't need to copy
   * @param {Campaign} model - Campaign
   */
  static HandleSingleConditionCase(model: Campaign): void {
    if (!this.HasMultipleConditionsOfRealEstate(model)) return;

    const firstCondition = model.Conditions[0];

    firstCondition.CompletionCount = model.CompletionCount;
    firstCondition.RewardType = model.RewardType;
    firstCondition.ImmediateReward = model.Reward;
    firstCondition.AmountInTokens = model.AmountInTokens;
    firstCondition.AmountInCurrency = model.AmountInCurrency;
    firstCondition.UsePartnerCurrencyRate = model.UsePartnerCurrencyRate;

    // set Base Award to zero
    model.Reward = '0';
  }

  static HandleSingleConditionCaseForEditRepresentation(model: Campaign): void {
    if (!this.HasMultipleConditionsOfRealEstate(model)) return;

    // set Base Award from first condition
    model.Reward = model.Conditions[0].ImmediateReward as string;
  }

  private static HasMultipleConditionsOfRealEstate(model: Campaign): boolean {
    return model.Conditions.length > 1 && model.Conditions[0].Type === BONUS_TYPES.ESTATE_LEAD_REFERRAL;
  }
}
