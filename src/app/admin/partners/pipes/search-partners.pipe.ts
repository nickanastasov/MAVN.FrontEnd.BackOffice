import {Pipe, PipeTransform} from '@angular/core';
import {PartnerRowResponse} from '../models/partner-row.interface';

@Pipe({
  name: 'searchPartners'
})
export class SearchPartnersPipe implements PipeTransform {
  transform(value: PartnerRowResponse[], searchText: string): PartnerRowResponse[] {
    if (value && value.length) {
      value.forEach(x => {
        if (!searchText || (searchText && x.Name.toLowerCase().indexOf(searchText.toLowerCase()) > -1)) {
          x.IsHidden = false;
        } else {
          x.IsHidden = true;
        }
      });
    }

    return value;
  }
}
