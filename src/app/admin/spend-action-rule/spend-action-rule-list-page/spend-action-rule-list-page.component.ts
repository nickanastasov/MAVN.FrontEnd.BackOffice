import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {SpendActionRuleRow} from '../models/spend-action-rule-row.interface';
import {SpendActionRuleService} from '../spend-action-rule.service';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {ActivatedRoute} from '@angular/router';
import {SettingsService} from 'src/app/core/settings/settings.service';
import * as constants from 'src/app/core/constants/const';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {BusinessVerticalType} from '../../partners/models/business-vertical.enum';

@Component({
  selector: 'app-spend-action-rule-list-page',
  templateUrl: './spend-action-rule-list-page.component.html',
  styleUrls: ['./spend-action-rule-list-page.component.scss'],
})
export class SpendActionRuleListPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  isLoading = true;
  isSearching: boolean;
  spendActionRules: SpendActionRuleRow[] = [];
  totalCount: number;
  searchTitleValue: string;
  isVisibleSearchTitle: boolean;
  currentPage = 0;
  baseCurrencyCode: string;
  tokenSymbol = constants.TOKEN_SYMBOL;
  BusinessVerticalType = BusinessVerticalType;
  initialPageSize: number;
  private pageSize: number;
  private getDataSubscription: Subscription;
  private isFirstLoad = true;

  @ViewChild('deleteActionRulePrompt', {static: true})
  deleteActionRulePrompt: ElementRef<HTMLElement>;
  @ViewChild('actionRuleDeletedMessage', {static: true})
  actionRuleDeletedMessage: ElementRef<HTMLElement>;

  @ViewChild('headerSubTitle', {static: true})
  headerSubTitle: ElementRef<HTMLElement>;

  private translates = {
    deleteActionRulePrompt: '',
    actionRuleDeletedMessage: '',
    headerSubTitle: '',
  };
  hasEditPermission = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private spendActionRuleService: SpendActionRuleService,
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
    this.translates.deleteActionRulePrompt = this.deleteActionRulePrompt.nativeElement.innerText;
    this.translates.actionRuleDeletedMessage = this.actionRuleDeletedMessage.nativeElement.innerText;
    this.translates.headerSubTitle = this.headerSubTitle.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerSubTitle,
      subHeaderContent: this.subHeaderTemplate,
    };

    this.route.queryParams.subscribe((params) => {
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

    this.route.queryParams.subscribe((params) => {
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

    this.getDataSubscription = this.spendActionRuleService.getAll(pageSize, currentPage, title).subscribe(
      (response) => {
        this.spendActionRules = response.BurnRules;
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

  deleteActionRule(spendActionRule: SpendActionRuleRow) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Message: this.translates.deleteActionRulePrompt.replace('$title', spendActionRule.Title),
      } as ConfirmationDialogData,
    });

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;

        this.spendActionRuleService.delete(spendActionRule.Id).subscribe(
          () => {
            this.getData(this.pageSize, this.currentPage + 1, this.searchTitleValue);
            this.snackBar.open(this.translates.actionRuleDeletedMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000,
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
