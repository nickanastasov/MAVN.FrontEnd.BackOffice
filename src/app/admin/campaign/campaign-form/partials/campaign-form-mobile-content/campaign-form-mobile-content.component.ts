import {Component, Input} from '@angular/core';
import {CampaignFormComponent} from '../../campaign-form.component';
import * as actionRulesConstants from '../../../../action-rule/constants/const';

@Component({
  selector: 'app-campaign-form-mobile-content',
  templateUrl: './campaign-form-mobile-content.component.html'
})
export class CampaignFromMobileContentComponent {
  @Input()
  campaign: CampaignFormComponent;
  MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION = actionRulesConstants.MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION;
}
