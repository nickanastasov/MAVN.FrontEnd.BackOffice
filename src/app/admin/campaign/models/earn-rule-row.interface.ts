import {CampaignStatus} from './campaign-status.enum';
import {RewardType} from './reward-type.enum';
import {BusinessVerticalType} from '../../partners/models/business-vertical.enum';
export interface EarnRuleRow {
  Id: string;
  Name: string;
  Asset: string;
  Reward: number;
  AmountInTokens: number;
  AmountInCurrency: number;
  RewardType: RewardType;
  FromDate: Date;
  ToDate: Date;
  Vertical?: BusinessVerticalType;
  Order: number;
  Status: CampaignStatus;
}
