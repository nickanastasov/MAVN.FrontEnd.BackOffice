import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {LoginAuth} from './models/login-auth.interface';
import {
  LS_KEY_COUNT_OF_OPENED_TABS,
  LS_KEY_TOKEN,
  LS_KEY_USER_FIRST_NAME,
  LS_KEY_USER_LAST_NAME,
  LS_KEY_USER_EMAIL,
  LS_KEY_USER_REGISTERED_DATE,
  LS_KEY_USER_ID,
  LS_KEY_USER_PERMISSIONS
} from '../core/constants/local-storage-keys';
import {Location} from '@angular/common';
import {ROUTE_FOR_AUTHENTICATION} from '../core/constants/routes';
import {User} from '../admin/user/models/user.interface';
import {LoginResponse} from './models/login-response.interface';
import {AdminPermission} from '../admin/user/models/admin-permission.interface';
import {PermissionRight} from '../admin/user/models/permission-right.class';
import {PermissionType} from '../admin/user/models/permission-type.enum';
import {PermissionLevel} from '../admin/user/models/permission-level.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isChangingLanguage: boolean;
  private _isInitializedUserPermissions = false;
  private _permissions: {[key: string]: PermissionRight};

  constructor(private apiHttp: ApiHttpService, private location: Location) {}

  login(loginCredentials: LoginAuth) {
    return this.apiHttp.post<LoginResponse>('/api/auth/login', loginCredentials, {headers: this.apiHttp.headersWithNoAuthorization()});
  }
  getUserData(): User {
    const user = new User({
      Id: localStorage.getItem(LS_KEY_USER_ID),
      FirstName: localStorage.getItem(LS_KEY_USER_FIRST_NAME),
      LastName: localStorage.getItem(LS_KEY_USER_LAST_NAME),
      Email: localStorage.getItem(LS_KEY_USER_EMAIL),
      Registered: new Date(localStorage.getItem(LS_KEY_USER_REGISTERED_DATE))
    });

    return user;
  }

  getUserPermissions(): {[key: string]: PermissionRight} {
    if (!this._isInitializedUserPermissions) {
      var value = localStorage.getItem(LS_KEY_USER_PERMISSIONS);
      const adminPermissions = value && (JSON.parse(value) as AdminPermission[]);
      const permissions = this.getEmptyPermissions();
      this.fillPermissions(permissions, adminPermissions);
      this._permissions = permissions;
      this._isInitializedUserPermissions = true;
    }

    return this._permissions;
  }

  getEmptyPermissions(): {[key: string]: PermissionRight} {
    const permissions = {
      [PermissionType.Dashboard]: new PermissionRight({IsOnlyView: true}),
      [PermissionType.Customers]: new PermissionRight(),
      [PermissionType.ActionRules]: new PermissionRight(),
      [PermissionType.BlockchainOperations]: new PermissionRight({IsOnlyView: true}),
      [PermissionType.Reports]: new PermissionRight({IsOnlyView: true}),
      [PermissionType.ProgramPartners]: new PermissionRight(),
      [PermissionType.Settings]: new PermissionRight(),
      [PermissionType.AdminUsers]: new PermissionRight()
    };

    return permissions;
  }

  fillPermissions(permissions: {[key: string]: PermissionRight}, adminPermissions: AdminPermission[]) {
    if (permissions && adminPermissions) {
      adminPermissions.forEach(adminPermission => {
        const permission = permissions[adminPermission.Type];

        if (permission) {
          if (adminPermission.Level == PermissionLevel.Edit) {
            permission.View = true;
            permission.Edit = permission.IsOnlyView ? false : true;
          } else if (adminPermission.Level == PermissionLevel.View) {
            permission.View = true;
          }
        }
      });
    }
  }

  setUserData(user: User) {
    localStorage.setItem(LS_KEY_USER_ID, user.Id);
    localStorage.setItem(LS_KEY_USER_FIRST_NAME, user.FirstName);
    localStorage.setItem(LS_KEY_USER_LAST_NAME, user.LastName);
    localStorage.setItem(LS_KEY_USER_EMAIL, user.Email);
    localStorage.setItem(LS_KEY_USER_REGISTERED_DATE, user.Registered.toString());
    localStorage.setItem(LS_KEY_USER_PERMISSIONS, JSON.stringify(user.Permissions));
  }

  setCookieToken(token: string) {
    document.cookie = `${LS_KEY_TOKEN}=${token}; Path=/;`;
  }

  clearCookieToken() {
    document.cookie = `${LS_KEY_TOKEN}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  clearToken() {
    localStorage.removeItem(LS_KEY_TOKEN);
  }

  logout() {
    const token = localStorage.getItem(LS_KEY_TOKEN);

    if (!token) {
      console.warn('no token in local storage');
      return;
    }

    this.apiHttp.post('/api/auth/logout', null).subscribe(
      () => {
        console.warn('logged out');
      },
      error => {
        console.error(error);
      }
    );

    this.clearToken();
    this.clearCookieToken();
  }

  preserveTokenIfReload() {
    const token = localStorage.getItem(LS_KEY_TOKEN);

    if (token) {
      sessionStorage.setItem(LS_KEY_TOKEN, token);
    }
  }

  restoreTokenIfReload() {
    const token = sessionStorage.getItem(LS_KEY_TOKEN);

    if (!token) {
      console.warn('no token in session storage');
      return;
    }

    sessionStorage.removeItem(LS_KEY_TOKEN);
    localStorage.setItem(LS_KEY_TOKEN, token);
    this.setCookieToken(token);

    this.apiHttp.post('/api/auth/decline-logout', null).subscribe(
      () => {
        console.warn('logout declined');
      },
      error => {
        console.error(error);
      }
    );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.apiHttp.post('/api/auth/changePassword', {
      CurrentPassword: currentPassword,
      NewPassword: newPassword
    });
  }

  getLoginPathWithReturnUrl(): string {
    const path = this.location.path();
    const href = ROUTE_FOR_AUTHENTICATION + (path && path.length && path !== '/' ? '?returnUrl=' + path : '');

    return href;
  }

  increaseCountOfOpenedTabs(): number {
    let countOfOpenedTabs = this.getCountOfOpenedTabs();
    countOfOpenedTabs++;
    localStorage.setItem(LS_KEY_COUNT_OF_OPENED_TABS, countOfOpenedTabs.toString());
    return countOfOpenedTabs;
  }

  descreaseCountOfOpenedTabs(): number {
    let countOfOpenedTabs = this.getCountOfOpenedTabs();
    countOfOpenedTabs--;

    if (countOfOpenedTabs < 0) {
      countOfOpenedTabs = 0;
    }

    localStorage.setItem(LS_KEY_COUNT_OF_OPENED_TABS, countOfOpenedTabs.toString());

    return countOfOpenedTabs;
  }

  getCountOfOpenedTabs(): number {
    let countOfOpenedTabs = 0;

    const countOfOpenedTabsFromStorage = localStorage.getItem(LS_KEY_COUNT_OF_OPENED_TABS);
    if (countOfOpenedTabsFromStorage) {
      countOfOpenedTabs = +countOfOpenedTabsFromStorage;
    }

    return countOfOpenedTabs;
  }

  resetCountOfOpenedTabs(): void {
    localStorage.setItem(LS_KEY_COUNT_OF_OPENED_TABS, '0');
  }
}
