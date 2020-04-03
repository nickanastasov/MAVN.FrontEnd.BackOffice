import {CampaignFormComponent} from '../campaign-form.component';
import {CampaignStatus} from '../../models/campaign-status.enum';

export function disableFormControlsByStatus(this: CampaignFormComponent, campaignStatus: CampaignStatus) {
  // for now we enable to edit everything in any status
  return;

  const disabledFieldsByStatus: {[key: string]: string[]} = {
    [CampaignStatus.Pending]: [],
    [CampaignStatus.Active]: [
      this.campaignFormProps.Reward,
      this.campaignFormProps.AmountInTokens,
      this.campaignFormProps.AmountInCurrency,
      this.campaignFormProps.UsePartnerCurrencyRate,
      this.campaignFormProps.RewardType,
      this.campaignFormProps.CompletionType,
      this.campaignFormProps.CompletionCount,
      this.campaignFormProps.Conditions,
      this.campaignFormProps.ApproximateAward
    ],
    [CampaignStatus.Inactive]: [
      this.campaignFormProps.Name,
      this.campaignFormProps.Reward,
      this.campaignFormProps.AmountInTokens,
      this.campaignFormProps.AmountInCurrency,
      this.campaignFormProps.UsePartnerCurrencyRate,
      this.campaignFormProps.RewardType,
      this.campaignFormProps.FromDate,
      this.campaignFormProps.ToDate,
      this.campaignFormProps.CompletionType,
      this.campaignFormProps.CompletionCount,
      this.campaignFormProps.Description,
      this.campaignFormProps.Conditions,
      this.campaignFormProps.ApproximateAward
    ],
    [CampaignStatus.Completed]: [
      this.campaignFormProps.Name,
      this.campaignFormProps.Reward,
      this.campaignFormProps.AmountInTokens,
      this.campaignFormProps.AmountInCurrency,
      this.campaignFormProps.UsePartnerCurrencyRate,
      this.campaignFormProps.RewardType,
      this.campaignFormProps.FromDate,
      this.campaignFormProps.ToDate,
      this.campaignFormProps.CompletionType,
      this.campaignFormProps.CompletionCount,
      this.campaignFormProps.IsEnabled,
      this.campaignFormProps.Description,
      this.campaignFormProps.Conditions,
      this.campaignFormProps.ApproximateAward
    ]
  };

  disabledFieldsByStatus[campaignStatus].forEach(controlName => this.campaignForm.get(controlName).disable());
}
