import {User} from 'src/app/admin/user/models/user.interface';

export interface LoginResponse {
  Token: string;
  AdminUser: User;
}
