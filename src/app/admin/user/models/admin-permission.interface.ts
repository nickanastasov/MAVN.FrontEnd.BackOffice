import {PermissionType} from './permission-type.enum';
import {PermissionLevel} from './permission-level.enum';

export interface AdminPermission {
  Type: PermissionType;
  Level: PermissionLevel;
}
