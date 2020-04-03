import {CampaignFormComponent} from '../campaign-form.component';
import * as constants from 'src/app/core/constants/const';
import {BonusType} from '../../models/bonus-type.interface';
import {AbstractControl} from '@angular/forms';
import {BusinessVerticalType} from 'src/app/admin/partners/models/business-vertical.enum';

export function partnersChanged(this: CampaignFormComponent) {
  this.setPartnerOrGlobalRate(this.getAllPartnerIds());

  this.conditionsFormArray.controls.forEach((_, index) => {
    if (index === 0) {
      return;
    }

    this.setPartnerOrGlobalRate(this.getAllPartnerIds(), index);
  });
}

export function checkPartnerAvailability(this: CampaignFormComponent, bonusType: BonusType, partnersControl: AbstractControl) {
  if (bonusType.Vertical && bonusType.Vertical === BusinessVerticalType.Hospitality) {
    partnersControl.enable();
  } else {
    partnersControl.disable();
  }
}

// protected
// get partnerIds from all conditions
export function getAllPartnerIds(this: CampaignFormComponent): string[] {
  let allPartnerIds: string[] = [];

  this.conditionsFormArray.controls.forEach(control => {
    const partnerId = control.get(this.conditionFormProps.PartnerId).value;

    if (partnerId) {
      allPartnerIds.push(partnerId);
    }
  });

  // make array to have only unique items
  allPartnerIds = Array.from(new Set(allPartnerIds));

  return allPartnerIds;
}

export function loadAllPartners(this: CampaignFormComponent) {
  this.isLoadingPartners = true;

  const page = 1;
  this.loadPagedPartners(page);
}

export function loadPagedPartners(this: CampaignFormComponent, page: number) {
  this.partnersService.getAll(constants.MAX_PAGE_SIZE, page, '').subscribe(
    response => {
      this.partners = [...this.partners, ...response.Partners];

      if (this.partners.length >= response.PagedResponse.TotalCount) {
        this.partners = this.partners.sort((a, b) => (a.Name > b.Name ? 1 : -1));
        this.isLoadingPartners = false;
        this.rateDependencyLoadedEventEmitter.emit();
      } else {
        page++;
        this.loadPagedPartners(page);
      }
    },
    () => {
      this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      this.isLoadingPartners = false;
    }
  );
}
