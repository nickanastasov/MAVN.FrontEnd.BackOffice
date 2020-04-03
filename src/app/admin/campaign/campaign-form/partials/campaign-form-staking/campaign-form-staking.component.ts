import {Component, Input} from '@angular/core';
import {CampaignFormComponent} from '../../campaign-form.component';
import {AbstractControl} from '@angular/forms';

@Component({
  selector: 'app-campaign-form-staking',
  templateUrl: './campaign-form-staking.component.html',
  styleUrls: ['./campaign-form-staking.component.scss']
})
export class CampaignFormStakingComponent {
  @Input()
  campaign: CampaignFormComponent;
  @Input()
  condition: AbstractControl;
}
