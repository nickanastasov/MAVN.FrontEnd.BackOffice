import {Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, ViewEncapsulation} from '@angular/core';
import {User} from '../models/user.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {FormBuilder, Validators} from '@angular/forms';
import {markFormControlAsTouched} from '../../../shared/utils/markFormControlAsTouched';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LengthValidator, EmailValidator, PhoneNumberValidator, OnlyLettersValidator} from 'src/app/shared/utils/validators';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {UserService} from '../user.service';
import {PermissionRight} from '../models/permission-right.class';
import {KeyValue} from '@angular/common';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../models/permission-type.enum';
import {AdminPermission} from '../models/admin-permission.interface';
import {PermissionLevel} from '../models/permission-level.enum';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersFormComponent implements OnInit {
  @Input()
  isSaving: boolean;

  @Output()
  submitSuccess: EventEmitter<User> = new EventEmitter<User>();

  @Input()
  user: User;

  PermissionType = PermissionType;
  hasEditPermission = false;
  isPartnerAdmin = false;

  userFormProps = {
    FirstName: 'FirstName',
    LastName: 'LastName',
    IsActive: 'IsActive',
    PhoneNumber: 'PhoneNumber',
    Email: 'Email',
    Company: 'Company',
    Department: 'Department',
    JobTitle: 'JobTitle',
    Password: 'Password',
  };

  companies = [
    {Type: 'Properties', DisplayName: 'Properties'},
    {Type: 'Hospitality', DisplayName: 'Hospitality'},
    {Type: 'Malls', DisplayName: 'Malls'},
    {Type: 'Hotels & Resorts', DisplayName: 'Hotels & Resorts'},
    {Type: 'Retail', DisplayName: 'Retail'},
    {Type: 'Community Management', DisplayName: 'Community Management'},
    {Type: 'Technologies', DisplayName: 'Technologies'},
    {Type: 'Industries and Investments', DisplayName: 'Industries and Investments'},
    {Type: 'Finance', DisplayName: 'Finance'},
    {Type: 'Investment Holdings', DisplayName: 'Investment Holdings'},
  ];

  departments = [
    {Type: 'Technology', DisplayName: 'Technology'},
    {Type: 'Finance', DisplayName: 'Finance'},
    {Type: 'Sales', DisplayName: 'Sales'},
    {Type: 'HR', DisplayName: 'HR'},
    {Type: 'Operations', DisplayName: 'Operations'},
  ];

  permissions: {[key: string]: PermissionRight};
  ViewAll = false;
  IndeterminateViewAll = false;
  EditAll = false;
  IndeterminateEditAll = false;

  // #region translates
  @ViewChild('fillRequiredFieldsMessage', {static: true})
  fillRequiredFieldsMessage: ElementRef<HTMLElement>;
  private translates = {
    fillRequiredFieldsMessage: '',
  };

  templates: GlobalTemplates;
  // #endregion

  constructor(
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.templates = this.translateService.templates;
    this.permissions = this.authenticationService.getEmptyPermissions();
    this.isPartnerAdmin = this.authenticationService.isPartnerAdmin();
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.AdminUsers].Edit || this.isPartnerAdmin;
  }

  userForm = this.fb.group({
    [this.userFormProps.FirstName]: [null, [Validators.required, LengthValidator(1, 255), OnlyLettersValidator]],
    [this.userFormProps.LastName]: [null, [Validators.required, LengthValidator(1, 255), OnlyLettersValidator]],
    [this.userFormProps.Email]: [null, [Validators.required, LengthValidator(1, 255), EmailValidator]],
    [this.userFormProps.PhoneNumber]: [null, [Validators.required, LengthValidator(1, 255), PhoneNumberValidator]],
    [this.userFormProps.IsActive]: [true, null],
    [this.userFormProps.Company]: [null, [Validators.required, LengthValidator(1, 255)]],
    [this.userFormProps.Department]: [null, [Validators.required, LengthValidator(1, 255)]],
    [this.userFormProps.JobTitle]: [null, [Validators.required, LengthValidator(1, 255)]],
    [this.userFormProps.Password]: [
      {
        value: '',
        disabled: true,
      },
      [Validators.required, LengthValidator(8, 25)],
    ],
  });
  previousPage = '';
  previousPageSize = '';

  ngOnInit() {
    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;

    // translates
    this.translates.fillRequiredFieldsMessage = this.fillRequiredFieldsMessage.nativeElement.innerText;

    if (this.user) {
      this.userForm.reset(this.user);
      this.userForm.get(this.userFormProps.Email).disable();
      this.userForm.get(this.userFormProps.Password).setValidators(null);
      this.userForm.get(this.userFormProps.Password).updateValueAndValidity();

      // handle permissions
      if (this.user.Permissions) {
        this.authenticationService.fillPermissions(this.permissions, this.user.Permissions);
      }

      this.changedEdit(null);
      this.changedView();

      if (!this.hasEditPermission) {
        this.userForm.disable();
      }
    } else {
      this.userForm.get(this.userFormProps.IsActive).disable();

      // set default permissions
      for (const permission of Object.values(this.permissions)) {
        permission.View = true;
      }

      this.changedView();

      this.userService.generateSuggestedPassword().subscribe(
        ({Password}) => {
          this.userForm.get(this.userFormProps.Password).patchValue(Password);
        },
        () => {
          this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        }
      );
    }
  }

  // #region permissions

  changedEditAll(): void {
    if (this.EditAll) {
      for (const permission of Object.values(this.permissions)) {
        if (!permission.IsOnlyView) {
          permission.Edit = true;
        }

        permission.View = true;
      }
    } else {
      for (const permission of Object.values(this.permissions)) {
        permission.Edit = false;
      }
    }

    this.changedView();
  }

  changedViewAll(): void {
    if (this.ViewAll) {
      for (const permission of Object.values(this.permissions)) {
        permission.View = true;
      }
    } else {
      for (const permission of Object.values(this.permissions)) {
        if (!permission.Edit) {
          permission.View = false;
        }
      }
    }
  }

  changedEdit(permission: PermissionRight): void {
    if (permission && permission.Edit) {
      permission.View = true;
      this.changedView();
    }

    if (this.hasEditAll) {
      this.EditAll = true;
      this.IndeterminateEditAll = false;
    } else if (this.hasEditAny) {
      this.IndeterminateEditAll = true;
    } else {
      this.EditAll = false;
      this.IndeterminateEditAll = false;
    }
  }

  changedView(): void {
    if (this.hasViewAll) {
      this.IndeterminateViewAll = false;
      this.ViewAll = true;
    } else if (this.hasViewAny) {
      this.IndeterminateViewAll = true;
    } else {
      this.ViewAll = false;
      this.IndeterminateViewAll = false;
    }
  }

  private get hasEditAny(): boolean {
    for (const permission of Object.values(this.permissions)) {
      if (permission.Edit) {
        return true;
      }
    }

    return false;
  }

  private get hasViewAny(): boolean {
    for (const permission of Object.values(this.permissions)) {
      if (permission.View) {
        return true;
      }
    }

    return false;
  }

  private get hasEditAll(): boolean {
    for (const permission of Object.values(this.permissions)) {
      if (!permission.Edit && !permission.IsOnlyView) {
        return false;
      }
    }

    return true;
  }

  private get hasViewAll(): boolean {
    for (const permission of Object.values(this.permissions)) {
      if (!permission.View) {
        return false;
      }
    }

    return true;
  }

  // #endregion

  //#region helper methods

  originalOrder = (_a: KeyValue<number, PermissionRight>, _b: KeyValue<number, PermissionRight>): number => {
    return 0;
  };

  //#endregion

  onSubmit() {
    if (!this.hasEditPermission) {
      return;
    }

    markFormControlAsTouched(this.userForm);

    if (!this.userForm.valid) {
      this.snackBar.open(this.translates.fillRequiredFieldsMessage, this.translateService.translates.CloseSnackbarBtnText, {
        duration: 5000,
      });
      return;
    }

    const user = this.userForm.getRawValue() as User;

    const adminPermissions: AdminPermission[] = [];

    // handle permissions
    for (const key in this.permissions) {
      if (this.permissions.hasOwnProperty(key)) {
        const permission = this.permissions[key];

        if (permission.Edit) {
          adminPermissions.push({
            Type: key as PermissionType,
            Level: permission.IsOnlyView ? PermissionLevel.View : PermissionLevel.Edit,
          });
        } else if (permission.View) {
          adminPermissions.push({
            Type: key as PermissionType,
            Level: PermissionLevel.View,
          });
        }
      }
    }

    user.Permissions = adminPermissions;

    this.submitSuccess.emit(user);
  }
}
