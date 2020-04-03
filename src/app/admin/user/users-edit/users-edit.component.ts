import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {User} from '../models/user.interface';
import {UserService} from '../user.service';
import {MatSnackBar, MatDialog} from '@angular/material';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {AdminPermission} from '../models/admin-permission.interface';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {PermissionType} from '../models/permission-type.enum';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss']
})
export class UsersEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isLoading = true;
  isSaving: boolean;
  isProcessingResetPassword = false;
  hasEditPermission = false;
  user: User;
  private userId: string;
  private previousPage = '';
  private previousPageSize = '';

  constructor(
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private headerMenuService: HeaderMenuService
  ) {
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.AdminUsers].Edit;
  }

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit User',
      subHeaderContent: this.subHeaderTemplate
    };

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.userId = this.route.snapshot.params.id;
    this.userService.getById(this.userId).subscribe(
      user => {
        this.user = user;
        this.isLoading = false;
      },
      () => {
        this.navigateToList();
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  resetPassword() {
    if (!this.hasEditPermission) {
      return;
    }

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: 'Reset Password',
        Message: 'Do you want to reset password of the user?'
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isProcessingResetPassword = true;
        this.userService.resetPassword(this.userId).subscribe(
          () => {
            this.isProcessingResetPassword = false;
            this.snackBar.open(
              'Admin user’s password has been successfully updated',
              this.translateService.translates.CloseSnackbarBtnText,
              {
                duration: 5000
              }
            );
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }

  onFormSubmit(formData: User) {
    this.isSaving = true;

    const permissions = formData.Permissions;
    formData.Permissions = null;
    formData.Id = this.userId;

    this.userService.update(formData).subscribe(
      () => {
        this.updatePermissions(this.userId, permissions);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private updatePermissions(adminUserId: string, permissions: AdminPermission[]) {
    const model = {
      AdminUserId: adminUserId,
      Permissions: permissions
    };

    this.userService.updatePermissions(model).subscribe(
      () => {
        this.handleSuccess();
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private handleSuccess() {
    this.snackBar.open('Admin user has been edited successfully', this.translateService.translates.CloseSnackbarBtnText, {
      duration: 5000
    });

    this.navigateToList();
  }

  private navigateToList() {
    this.router.navigate(['/admin/platform/users'], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize
      }
    });
  }
}
