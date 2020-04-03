import {Subscription} from 'rxjs';

export interface IConditionSubscriptionsHolder {
  StakingPeriodSubscription: Subscription;
  RewardTypeSubscription: Subscription;
  UseRateSubscription: Subscription;
}
