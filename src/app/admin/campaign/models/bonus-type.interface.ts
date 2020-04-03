export interface BonusType {
  Type: string;
  DisplayName: string;
  Vertical?: string;
  AllowInfinite: boolean;
  AllowPercentage: boolean;
  AllowConversionRate: boolean;
  IsStakeable: boolean;
  // when special bonus type 'estate-lead-referral' is selected
  // the hidden bonust types can be added as optional
  IsHidden: boolean;
  // use only for Real Estate added optional reward
  RewardHasRatio: boolean;
}
