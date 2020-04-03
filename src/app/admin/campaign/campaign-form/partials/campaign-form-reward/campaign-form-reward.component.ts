import {Component, Input} from '@angular/core';
import {CampaignFormComponent} from '../../campaign-form.component';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-campaign-form-reward',
  templateUrl: './campaign-form-reward.component.html',
  styleUrls: ['./campaign-form-reward.component.scss']
})
export class CampaignFormRewardComponent {
  baseCurrencyCode: string;

  constructor(private settingsService: SettingsService) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
  }

  @Input()
  campaign: CampaignFormComponent;
}
