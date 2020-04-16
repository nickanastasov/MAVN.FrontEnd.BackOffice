import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatSnackBar, MatDialog} from '@angular/material';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {SmartVoucherCampaignRow} from '../models/smart-voucher-row.interface';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {ActivatedRoute} from '@angular/router';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {SmartVoucherService} from '../smart-voucher.service';

@Component({
  selector: 'app-smart-voucher-list-page',
  templateUrl: './smart-voucher-list-page.component.html',
  styleUrls: ['./smart-voucher-list-page.component.scss']
})
export class SmartVoucherListPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isLoading = true;
  isSearching: boolean;
  campaigns: SmartVoucherCampaignRow[] = [];
  totalCount: number;
  searchTitleValue: string;
  isVisibleSearchTitle: boolean;
  currentPage = 0;
  baseCurrencyCode: string;
  initialPageSize: number;
  pageSize: number;
  private getDataSubscription: Subscription;
  private isFirstLoad = true;

  @ViewChild('headerTitle')
  headerTitle: ElementRef<HTMLElement>;
  @ViewChild('deletePrompt')
  deletePrompt: ElementRef<HTMLElement>;
  @ViewChild('deletedMessage')
  deletedMessage: ElementRef<HTMLElement>;

  private translates = {
    headerTitle: '',
    deletePrompt: '',
    deletedMessage: ''
  };
  hasEditPermission = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private smartVoucherService: SmartVoucherService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ActionRules].Edit;
  }

  ngOnInit() {
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;
    this.translates.deletePrompt = this.deletePrompt.nativeElement.innerText;
    this.translates.deletedMessage = this.deletedMessage.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate
    };

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

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    let page;

    this.route.queryParams.subscribe(params => {
      page = +params['page'];
    });

    this.pageSize = pageEvent.PageSize;

    this.currentPage = this.isFirstLoad ? page || pageEvent.CurrentPage : pageEvent.CurrentPage;
    this.isFirstLoad = false;

    if (this.searchTitleValue) {
      this.searchTitle();
    } else {
      this.isLoading = true;
      this.getData(pageEvent.PageSize, this.currentPage + 1);
    }
  }

  getData(pageSize: number, currentPage: number, title: string = '') {
    if (this.getDataSubscription) {
      this.getDataSubscription.unsubscribe();
    }

    this.getDataSubscription = this.smartVoucherService.getAll(pageSize, currentPage, title).subscribe(
      response => {
        this.campaigns = response.SmartVoucherCampaigns;
        this.totalCount = response.PagedResponse.TotalCount;
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      },
      () => {
        this.isLoading = false;
        this.isSearching = false;
      }
    );
  }

  deleteCampaign(campaign: SmartVoucherCampaignRow) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Message: this.translates.deletePrompt.replace('{{name}}', campaign.Name)
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        this.smartVoucherService.delete(campaign.Id).subscribe(
          () => {
            this.getData(this.pageSize, this.currentPage + 1, this.searchTitleValue);
            this.snackBar.open(this.translates.deletedMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000
            });
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          },
          () => {
            this.isLoading = false;
            this.isSearching = false;
          }
        );
      }
    });
  }

  toggleSearchTitle() {
    this.isVisibleSearchTitle = !this.isVisibleSearchTitle;

    if (!this.isVisibleSearchTitle && this.searchTitleValue) {
      this.searchTitleValue = '';
      this.searchTitleValueChanged();
    }
  }

  searchTitle() {
    this.isSearching = true;
    this.currentPage = 0;
    this.getData(this.pageSize, 1, this.searchTitleValue);
  }

  searchTitleValueChanged() {
    if (!this.searchTitleValue) {
      this.clearTitle();
    }
  }

  clearTitle() {
    this.searchTitleValue = '';
    this.isSearching = true;
    this.getData(this.pageSize, 1);
  }
}
