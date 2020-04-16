import {Injectable} from '@angular/core';
import {MobileLanguage} from '../models/mobile-language.enum';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  getMobileLanguages(): MobileLanguage[] {
    return [MobileLanguage.En, MobileLanguage.De];
  }
}
