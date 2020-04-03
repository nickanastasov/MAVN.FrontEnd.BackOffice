import {Pipe, PipeTransform} from '@angular/core';
import {BusinessVerticalType} from '../models/business-vertical.enum';
import {PartnerRowResponse} from '../models/partner-row.interface';

@Pipe({
  name: 'partnersByVertical'
})
export class PartnersByVerticalPipe implements PipeTransform {
  transform(value: PartnerRowResponse[], vertical: BusinessVerticalType): PartnerRowResponse[] {
    if (value && value.length && vertical) {
      const result = value.filter(x => x.BusinessVertical && x.BusinessVertical === vertical);
      return result;
    }

    return value;
  }
}
