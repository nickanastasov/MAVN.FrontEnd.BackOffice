import {BonusTypeExtended} from './../../admin/campaign/models/bonus-type-extended.interface';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'hideRules'
})
export class HideRulesPipe implements PipeTransform {
  transform(bonusType: any[]): any[] {
    return bonusType.filter((object: BonusTypeExtended) => {
      return object.DisplayTag !== 'Hospitality' && object.DisplayTag !== 'Real Estate';
    });
  }
}
