import {Component, HostListener, OnInit, HostBinding, Inject, LOCALE_ID} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @HostBinding('attr.dir') dir = 'ltr';

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander() {
    const countOfOpenedTabs = this.authenticationService.getCountOfOpenedTabs();

    // if this is the last opened tab, then making logout
    if (countOfOpenedTabs <= 1 && !this.authenticationService.isChangingLanguage) {
      this.authenticationService.resetCountOfOpenedTabs();
      this.authenticationService.preserveTokenIfReload();
      this.authenticationService.logout();
    } else {
      this.authenticationService.descreaseCountOfOpenedTabs();
    }
  }

  constructor(private authenticationService: AuthenticationService, @Inject(LOCALE_ID) private locale: string) {}

  ngOnInit(): void {
    console.log(this.locale);

    if (this.locale.startsWith('ar')) {
      this.dir = 'rtl';
    }

    this.authenticationService.increaseCountOfOpenedTabs();
    this.authenticationService.restoreTokenIfReload();
  }
}
