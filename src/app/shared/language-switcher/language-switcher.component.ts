import {Component, OnInit, LOCALE_ID, Inject, ViewEncapsulation} from '@angular/core';

import {LANGUAGES} from 'src/app/core/constants/const';
import {AuthenticationService} from 'src/app/authentication/authentication.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageSwitcherComponent implements OnInit {
  LOCALES = LANGUAGES;
  currentLocale = '';

  constructor(private authenticationService: AuthenticationService, @Inject(LOCALE_ID) private locale: string) {
    if (this.locale.startsWith(LANGUAGES.English)) {
      this.currentLocale = LANGUAGES.English;
    } else if (this.locale.startsWith(LANGUAGES.German)) {
      this.currentLocale = LANGUAGES.German;
    }
  }

  ngOnInit() {}

  changeLanguage(locale: string) {
    const l = window.location;

    const langCode = '/' + locale;
    const pathname = langCode + l.pathname.substr(langCode.length);

    this.authenticationService.isChangingLanguage = true;

    window.location.href = l.origin + pathname + l.search;
  }
}
