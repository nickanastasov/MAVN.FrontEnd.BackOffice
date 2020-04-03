import {Component, Input} from '@angular/core';
import {CampaignFormComponent} from '../../campaign-form.component';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-campaign-form-optional-conditions',
  templateUrl: './campaign-form-optional-conditions.component.html',
  styleUrls: ['./campaign-form-optional-conditions.component.scss']
})
export class CampaignFromOptionalConditionsComponent {
  baseCurrencyCode: string;

  constructor(private settingsService: SettingsService) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
  }

  @Input()
  campaign: CampaignFormComponent;
}
