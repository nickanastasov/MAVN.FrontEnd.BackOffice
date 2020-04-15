import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {User} from '../models/user.interface';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {AdminPermission} from '../models/admin-permission.interface';
import {ErrorResponse} from '../models/error-response.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isLoading: boolean;

  @ViewChild('successMessageElement')
  successMessageElement: ElementRef;
  successMessage: string;

  @ViewChild('errorAdminExistsMessageElement')
  errorAdminExistsMessageElement: ElementRef;
  errorAdminExistsMessage: string;

  user: User;

  @ViewChild('headerTitle')
  headerTitle: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: ''
  };

  constructor(
    private translateService: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate
    };

    this.successMessage = (this.successMessageElement.nativeElement as HTMLElement).innerText;
    this.errorAdminExistsMessage = (this.errorAdminExistsMessageElement.nativeElement as HTMLElement).innerText;
  }

  onFormSubmit(formData: User) {
    this.isLoading = true;

    const permissions = formData.Permissions;
    formData.Permissions = null;

    this.userService.create(formData).subscribe(
      user => {
        this.updatePermissions(user.Id, permissions);
      },
      (e: HttpErrorResponse) => {
        const message = e.error as ErrorResponse;

        if (message.error === 'AdminAlreadyRegistered') {
          this.snackBar.open(this.errorAdminExistsMessage, this.translateService.translates.CloseSnackbarBtnText, {
            duration: 5000
          });
        } else {
          this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        }

        this.isLoading = false;
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
    this.snackBar.open(this.successMessage, this.translateService.translates.CloseSnackbarBtnText, {
      duration: 5000
    });

    this.router.navigate(['/admin/platform/users']);
  }
}
