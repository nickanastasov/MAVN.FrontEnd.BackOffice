import {Component, OnInit, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {CampaignService} from '../campaign.service';
import {CampaignStatus} from '../models/campaign-status.enum';
import {MatDialog} from '@angular/material';
import {ConfirmationDialogComponent} from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {RewardType} from '../models/reward-type.enum';
import {EarnRuleRow} from '../models/earn-rule-row.interface';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {BusinessVerticalType} from '../../partners/models/business-vertical.enum';

@Component({
  selector: 'app-campaigns-list-page',
  templateUrl: './campaigns-list-page.component.html',
  styleUrls: ['./campaigns-list-page.component.scss']
})
export class CampaignsListPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  loading = true;
  isSearching: boolean;
  earnRules: EarnRuleRow[];
  totalCount: number;
  searchTitleValue: string;
  isVisibleSearchTitle: boolean;
  CampaignStatus = CampaignStatus;
  RewardType = RewardType;
  currentPage = 0;
  baseCurrencyCode: string;
  initialPageSize: number;
  BusinessVerticalType = BusinessVerticalType;
  private pageSize: number;
  private getDataSubscription: Subscription;
  hasEditPermission = false;

  @ViewChild('deleteSuccessMessage')
  deleteSuccessMessage: ElementRef<HTMLElement>;
  private translates = {
    deleteSuccessMessage: ''
  };

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private campaignService: CampaignService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ActionRules].Edit;

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
    this.headerMenuService.headerMenuContent = {
      title: 'Earn Rules',
      subHeaderContent: this.subHeaderTemplate
    };

    this.translates.deleteSuccessMessage = this.deleteSuccessMessage.nativeElement.innerText;
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.currentPage = pageEvent.CurrentPage;
    this.pageSize = pageEvent.PageSize;

    if (this.searchTitleValue) {
      this.searchTitle();
    } else {
      this.loading = true;
      this.getData(pageEvent.PageSize, this.currentPage + 1);
    }
  }

  getData(pageSize: number, currentPage: number, name: string = '') {
    if (this.getDataSubscription) {
      this.getDataSubscription.unsubscribe();
    }

    this.getDataSubscription = this.campaignService.getAll(pageSize, currentPage, name).subscribe(
      response => {
        this.earnRules = response.EarnRules;
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

  delete(earnRule: EarnRuleRow) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Message: 'Do you really want to delete earn action rule "' + earnRule.Name + '"?'
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.campaignService.delete(earnRule.Id).subscribe(
          () => {
            this.loading = true;
            this.getData(this.pageSize, this.currentPage + 1, this.searchTitleValue || '');

            this.snackBar.open(this.translates.deleteSuccessMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000
            });
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
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
