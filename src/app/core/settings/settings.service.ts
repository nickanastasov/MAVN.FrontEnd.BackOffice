import {APP_INITIALIZER, Injectable, Provider} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';
import {Settings} from './settings.interface';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  static appInitializerProviders: Provider[] = [
    SettingsService,
    {
      provide: APP_INITIALIZER,
      useFactory: SettingsService.loadSettingsFactoryProvider,
      deps: [SettingsService],
      multi: true
    }
  ];

  get apiUrl() {
    return this._settings && this._settings.BackofficePlatform.AdminApiGatewayUrl;
  }

  get helpDocumentUrl() {
    return this._settings && this._settings.BackofficePlatform.HelpDocumentUrl;
  }

  get hideBlockchainMenu() {
    return this._settings && this._settings.BackofficePlatform.HideBlockchainMenu;
  }

  get hideTransactionsMenu() {
    return this._settings && this._settings.BackofficePlatform.HideTransactionsMenu;
  }

  get hideSegmentMenu() {
    return this._settings && this._settings.BackofficePlatform.HideSegmentMenu;
  }

  get hideTierMenu() {
    return this._settings && this._settings.BackofficePlatform.HideTierMenu;
  }

  get baseCurrencyCode() {
    return this._settings && this._settings.BackofficePlatform.BaseCurrencyCode;
  }

  get PasswordValidationRules() {
    return this._settings && this._settings.BackofficePlatform.PasswordValidationSettings;
  }

  get MobileAppImageFileSizeInKB() {
    return this._settings && this._settings.BackofficePlatform.MobileAppImageFileSizeInKB;
  }

  get MobileAppImageMinWidth() {
    return this._settings && this._settings.BackofficePlatform.MobileAppImageMinWidth;
  }

  get MobileAppImageMinHeight() {
    return this._settings && this._settings.BackofficePlatform.MobileAppImageMinHeight;
  }

  get IsRealEstateFeatureDisabled() {
    return this._settings && this._settings.BackofficePlatform.IsRealEstateFeatureDisabled;
  }

  get IsPublicBlockchainFeatureDisabled() {
    return this._settings && this._settings.BackofficePlatform.IsPublicBlockchainFeatureDisabled;
  }

  private _settings: Readonly<Settings>;

  readonly baseSettings$ = this.getSettings().pipe(
    tap(settings => {
      this._settings = Object.freeze(settings);
    }),
    shareReplay(1)
  );

  static loadSettingsFactoryProvider(settings: SettingsService) {
    return () => settings.baseSettings$.toPromise().catch(() => true);
  }

  static baseUrlFactory(settings: SettingsService) {
    return settings.apiUrl;
  }

  constructor(private http: HttpClient) {}

  getSettings() {
    let path = 'nginx/env-config.json';

    if (environment.production) {
      path = '/env-config.json';
    }

    path += `?v=${new Date().toISOString()}`;

    return this.http.get<Settings>(path);
  }
}
