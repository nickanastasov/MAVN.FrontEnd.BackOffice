import {AdminPermission} from './admin-permission.interface';

export class User {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Registered: Date;
  PhoneNumber: string;
  IsActive: boolean;
  Company: string;
  Department: string;
  JobTitle: string;
  Permissions: AdminPermission[];

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}
