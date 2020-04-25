import {Injectable} from '@angular/core';
import {ApiHttpService} from 'ngx-api-utils';
import {AdminListResponse} from './models/admin-list-response.interface';
import {User} from './models/user.interface';
import {toParamsString} from 'src/app/shared/utils/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiPath = '/api/admins';

  constructor(private apiHttp: ApiHttpService) {}

  get(pageSize: number, currentPage: number, searchValue: string, active: boolean) {
    // purpose is to avoid putting details into AppInsights
    return this.apiHttp.post<AdminListResponse>(this.apiPath + '/search', {
      pageSize: pageSize,
      currentPage: currentPage,
      searchValue: searchValue,
      active: active,
    });
  }

  getById(adminUserId: string) {
    const paramsStr = toParamsString({adminUserId: adminUserId});

    return this.apiHttp.get<User>(this.apiPath + '/query' + paramsStr);
  }

  resetPassword(adminUserId: string) {
    return this.apiHttp.post(this.apiPath + '/resetPassword', {adminId: adminUserId});
  }

  generateSuggestedPassword() {
    return this.apiHttp.get<any>(this.apiPath + '/generateSuggestedPassword');
  }

  create(userData: User) {
    return this.apiHttp.post<User>(this.apiPath, {...userData});
  }

  register(model: any) {
    return this.apiHttp.post<User>(this.apiPath + '/register', {...model}, {headers: this.apiHttp.headersWithNoAuthorization()});
  }

  update(userData: User) {
    return this.apiHttp.put<User>(this.apiPath, {...userData});
  }

  updatePermissions(model: any) {
    return this.apiHttp.put(this.apiPath + '/permissions', {...model});
  }
}
