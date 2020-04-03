import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModuleWithProviders} from '@angular/compiler/src/core';
import {
  NgxApiUtilsModule,
  API_HTTP_BASE_URL,
  API_AUTH_GUARD_PUBLIC_ONLY_ROUTES,
  API_AUTH_GUARD_URL_FOR_AUTHENTICATION,
  API_AUTH_GUARD_URL_FOR_AUTHENTICATED
} from 'ngx-api-utils';
import {SettingsService} from './settings/settings.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './interceptors/auth.interseptor';
import {ROUTE_FOR_AUTHENTICATION} from './constants/routes';

export const publicOnlyRoutesRegexp = /^\/(authentication\/login)([\/#?].*)?$/;

@NgModule({
  imports: [CommonModule, NgxApiUtilsModule],
  declarations: []
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        SettingsService.appInitializerProviders,
        {
          provide: API_HTTP_BASE_URL,
          useFactory: SettingsService.baseUrlFactory,
          deps: [SettingsService]
        },
        {
          provide: API_AUTH_GUARD_PUBLIC_ONLY_ROUTES,
          useValue: publicOnlyRoutesRegexp
        },
        {
          provide: API_AUTH_GUARD_URL_FOR_AUTHENTICATED,
          useValue: 'admin/platform/dashboard/intro'
        },
        {
          provide: API_AUTH_GUARD_URL_FOR_AUTHENTICATION,
          useValue: ROUTE_FOR_AUTHENTICATION
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    };
  }
}
