import {Component, Input} from '@angular/core';
import {CampaignFormComponent} from '../../campaign-form.component';

@Component({
  selector: 'app-campaign-form-conditions',
  templateUrl: './campaign-form-conditions.component.html',
  styleUrls: ['./campaign-form-conditions.component.scss']
})
export class CampaignFormConditionsComponent {
  @Input()
  campaign: CampaignFormComponent;
}
