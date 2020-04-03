import {Injectable} from '@angular/core';
import {BusinessVerticalTypeItem} from '../models/business-vertical-type-item.interface';
import {BusinessVerticalType} from '../models/business-vertical.enum';

@Injectable({
  providedIn: 'root'
})
export class BusinessVerticalService {
  private businessVerticalItems: BusinessVerticalTypeItem[];

  getBusinessVerticalItems() {
    return [...this.businessVerticalItems];
  }

  setBusinessVerticalItems(items: BusinessVerticalTypeItem[]): void {
    this.businessVerticalItems = items;
  }

  constructor() {
    this.businessVerticalItems = [
      {Type: BusinessVerticalType.Hospitality, DisplayName: ''},
      {Type: BusinessVerticalType.RealEstate, DisplayName: ''},
      {Type: BusinessVerticalType.Retail, DisplayName: ''}
    ];
  }
}
