import {CampaignFormComponent} from '../campaign-form.component';

export function loadRate(this: CampaignFormComponent): void {
  this.globalSettingsService.getGlobalRate().subscribe(
    response => {
      this.globalRate = response;

      this.rateDependencyLoadedEventEmitter.emit();
    },
    error => {
      console.error(error);
      this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
    }
  );
}

export function setPartnerOrGlobalRate(this: CampaignFormComponent, partnerIds: string[], conditionIndex = -1): void {
  const usePartnerCurrencyRateOfCondition =
    conditionIndex >= 0 && this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.UsePartnerCurrencyRate).value;

  if (partnerIds && (this.usePartnerCurrencyRate || usePartnerCurrencyRateOfCondition)) {
    if (partnerIds.length > 1 || !partnerIds.length) {
      // now we can have only one selected partner in single condition
      this.setToGlobalRate(usePartnerCurrencyRateOfCondition ? conditionIndex : -1);
    } else if (partnerIds.length === 1) {
      const partner = this.partners.find(x => x.Id === partnerIds[0]);

      if (!partner) {
        return;
      }

      if (partner.UseGlobalCurrencyRate) {
        this.setToGlobalRate(usePartnerCurrencyRateOfCondition ? conditionIndex : -1);
      } else {
        // set partners rate
        const tokensControl = usePartnerCurrencyRateOfCondition
          ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInTokens)
          : this.tokensControl;

        const currencyControl = usePartnerCurrencyRateOfCondition
          ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInCurrency)
          : this.currencyControl;

        tokensControl.setValue(partner.AmountInTokens);
        currencyControl.setValue(partner.AmountInCurrency);
        this.toggleDisablingOfRateFields(true, usePartnerCurrencyRateOfCondition ? conditionIndex : -1);
      }
    }
  }
}

export function setToGlobalRate(this: CampaignFormComponent, conditionIndex = -1): void {
  if (!this.globalRate) {
    return;
  }

  const tokensControl =
    conditionIndex >= 0 ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInTokens) : this.tokensControl;

  const currencyControl =
    conditionIndex >= 0 ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInCurrency) : this.currencyControl;

  tokensControl.setValue(this.globalRate.AmountInTokens);
  currencyControl.setValue(this.globalRate.AmountInCurrency);
  this.toggleDisablingOfRateFields(true, conditionIndex);
}

export function toggleDisablingOfRateFields(this: CampaignFormComponent, disable: boolean, conditionIndex = -1): void {
  const tokensControl =
    conditionIndex >= 0 ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInTokens) : this.tokensControl;

  const currencyControl =
    conditionIndex >= 0 ? this.conditionsFormArray.at(conditionIndex).get(this.conditionFormProps.AmountInCurrency) : this.currencyControl;

  if (disable) {
    tokensControl.disable();
    currencyControl.disable();
  } else {
    tokensControl.enable();
    currencyControl.enable();
  }
}
