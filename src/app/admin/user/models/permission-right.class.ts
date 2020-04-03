export class PermissionRight {
  View = false;
  IsOnlyView = false;
  Edit = false;

  constructor(init?: Partial<PermissionRight>) {
    Object.assign(this, init);
  }
}
