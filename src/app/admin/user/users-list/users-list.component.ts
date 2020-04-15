import {Component, ViewChild, TemplateRef, OnInit, ElementRef} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {User} from '../models/user.interface';
import {UserService} from '../user.service';
import {Subscription} from 'rxjs';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../models/permission-type.enum';
import {ActivatedRoute} from '@angular/router';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {AdminStatusFilter} from '../models/admin-status-filter.enum';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  initialPageSize: number;
  private pageSize: number;
  private subscription: Subscription;

  loading = true;
  currentPage = 0;
  isSearching: boolean;
  searchEmailValue: string = '';
  isVisibleSearchEmail: boolean;
  searchStatusValue: AdminStatusFilter = AdminStatusFilter.All;
  searchStatusFilterValues: Array<{Value: AdminStatusFilter; DisplayName: string}> = [
    {Value: AdminStatusFilter.All, DisplayName: 'All'},
    {Value: AdminStatusFilter.Active, DisplayName: 'Active'},
    {Value: AdminStatusFilter.NotActive, DisplayName: 'Not active'}
  ];
  isVisibleSearchStatus: boolean;
  users: User[];
  totalCount: number;
  hasEditPermission = false;

  @ViewChild('headerTitle')
  headerTitle: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: ''
  };

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private headerMenuService: HeaderMenuService
  ) {
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.AdminUsers].Edit;

    this.route.queryParams.subscribe(params => {
      const page = +params['page'];
      const pageSize = +params['pageSize'];

      if (page) {
        this.currentPage = page;
      }

      if (pageSize) {
        this.initialPageSize = pageSize;
      }
    });
  }

  ngOnInit() {
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate
    };
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.currentPage = pageEvent.CurrentPage;
    this.pageSize = pageEvent.PageSize;

    this.loading = true;
    this.load(pageEvent.PageSize, this.currentPage + 1);
  }

  search() {
    this.isSearching = true;
    this.currentPage = 0;
    this.load(this.pageSize, 1);
  }

  //#region search email

  toggleSearchEmail() {
    this.isVisibleSearchEmail = !this.isVisibleSearchEmail;

    if (!this.isVisibleSearchEmail && this.searchEmailValue) {
      this.clearEmail();
    }
  }

  searchEmailValueChanged() {
    if (!this.searchEmailValue) {
      this.clearEmail();
    }
  }

  clearEmail() {
    this.searchEmailValue = '';
    this.search();
  }

  //#endregion

  //#region filter by status

  toggleSearchStatus() {
    this.isVisibleSearchStatus = !this.isVisibleSearchStatus;

    if (!this.isVisibleSearchStatus) {
      this.clearStatus();
    }
  }

  searchStatusValueChanged() {
    this.search();
  }

  clearStatus() {
    if (this.searchStatusValue !== AdminStatusFilter.All) {
      this.searchStatusValue = AdminStatusFilter.All;
      this.search();
    }
  }

  //#endregion

  load(pageSize: number, currentPage: number) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    let active: boolean;

    switch (this.searchStatusValue) {
      case AdminStatusFilter.Active:
        active = true;
        break;
      case AdminStatusFilter.NotActive:
        active = false;
        break;
      default:
        active = null;
        break;
    }

    this.subscription = this.userService.get(pageSize, currentPage, this.searchEmailValue, active).subscribe(
      response => {
        this.users = response.Items;
        this.totalCount = response.PagedResponse.TotalCount;
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      },
      () => {
        this.loading = false;
        this.isSearching = false;
      }
    );
  }
}
