import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewContainerRef, ViewEncapsulation, Inject, LOCALE_ID} from '@angular/core';
import {HeaderMenuService} from '../services/header-menu.service';
import {Subscription} from 'rxjs';
import {LANGUAGES} from 'src/app/core/constants/const';
import {AuthenticationService} from 'src/app/authentication/authentication.service';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderMenuComponent implements OnInit, OnDestroy {
  headerTitle: string = '';
  LOCALES = LANGUAGES;
  currentLocale = '';

  @ViewChild('headerWrapper', {static: true}) private headerWrapperRef: ElementRef<HTMLElement>;
  @ViewChild('subHeaderContentViewContainer', {read: ViewContainerRef, static: true})
  private subHeaderContentViewContainer: ViewContainerRef;

  private headerMenuServiceSubscriber: Subscription;
  constructor(
    // services
    private authenticationService: AuthenticationService,
    private headerMenuService: HeaderMenuService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    if (this.locale.startsWith(LANGUAGES.English)) {
      this.currentLocale = LANGUAGES.English;
    } else if (this.locale.startsWith(LANGUAGES.German)) {
      this.currentLocale = LANGUAGES.German;
    }
  }

  ngOnInit() {
    window.addEventListener('scroll', this.handleScroll, false);

    this.headerMenuServiceSubscriber = this.headerMenuService.listenForHeaderMenuContentChange().subscribe((headerMenuContent: any) => {
      this.headerTitle = headerMenuContent.title;
      this.subHeaderContentViewContainer.clear();
      this.subHeaderContentViewContainer.createEmbeddedView(headerMenuContent.subHeaderContent);
    });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll, false);

    if (this.headerMenuServiceSubscriber) {
      this.headerMenuServiceSubscriber.unsubscribe();
    }
  }

  changeLanguage(locale: string) {
    const l = window.location;

    const langCode = '/' + locale;
    const pathname = langCode + l.pathname.substr(langCode.length);

    this.authenticationService.isChangingLanguage = true;

    window.location.href = l.origin + pathname + l.search;
  }

  private handleScroll = () => {
    if (window.scrollY > 26) {
      if (!this.headerWrapperRef.nativeElement.classList.contains('shadowed-bottom')) {
        this.headerWrapperRef.nativeElement.classList.add('shadowed-bottom');
      }
    } else {
      if (this.headerWrapperRef.nativeElement.classList.contains('shadowed-bottom')) {
        this.headerWrapperRef.nativeElement.classList.remove('shadowed-bottom');
      }
    }
  };
}
