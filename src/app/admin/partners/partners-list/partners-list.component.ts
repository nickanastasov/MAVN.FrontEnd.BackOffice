import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {PartnersService} from '../partners.service';
import {MatSnackBar} from '@angular/material';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {PartnerRowResponse} from '../models/partner-row.interface';
import {Subscription} from 'rxjs';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {GlobalSettingsService} from '../../global-settings/services/global-settings.service';
import {GlobalRate} from '../../global-settings/models/global-rate.interface';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {ActivatedRoute} from '@angular/router';
import {BusinessVerticalType} from '../models/business-vertical.enum';
import {BusinessVerticalService} from '../services/business-vertical.service';
import {BusinessVerticalTypeItem} from '../models/business-vertical-type-item.interface';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-partners-list',
  templateUrl: './partners-list.component.html',
  styleUrls: ['./partners-list.component.scss']
})
export class PartnersListComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  assetSymbol = TOKEN_SYMBOL;
  baseCurrencyCode: string;
  loading = true;
  isSearching: boolean;
  dataSource: PartnerRowResponse[] = [];
  BusinessVertical = BusinessVerticalType;
  totalCount: number;
  searchNameValue: string;
  isVisibleSearchName: boolean;
  currentPage = 0;
  initialPageSize: number;
  private pageSize: number;
  private getDataSubscription: Subscription;
  private globalRate: GlobalRate;
  businessVerticalTypes: BusinessVerticalTypeItem[] = [];
  hasEditPermission = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private globalSettingsService: GlobalSettingsService,
    private partnersService: PartnersService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private businessVerticalService: BusinessVerticalService,
    private headerMenuService: HeaderMenuService
  ) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.businessVerticalTypes = this.businessVerticalService.getBusinessVerticalItems();
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.ProgramPartners].Edit;

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
      title: 'Partners',
      subHeaderContent: this.subHeaderTemplate
    };
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.currentPage = pageEvent.CurrentPage;
    this.pageSize = pageEvent.PageSize;

    if (this.searchNameValue) {
      this.searchName();
    } else {
      this.loading = true;
      const callback = () => this.getData(pageEvent.PageSize, this.currentPage + 1);

      this.globalRate ? callback() : this.loadRate(callback);
    }
  }

  private loadRate(callback: Function): void {
    this.globalSettingsService.getGlobalRate().subscribe(
      response => {
        this.globalRate = response;

        if (callback) {
          callback();
        }
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  getData(pageSize: number, currentPage: number, name: string = '') {
    if (this.getDataSubscription) {
      this.getDataSubscription.unsubscribe();
    }

    this.getDataSubscription = this.partnersService.getAll(pageSize, currentPage, name).subscribe(
      response => {
        // handle global rate
        response.Partners.forEach(x => {
          if (x.UseGlobalCurrencyRate && this.globalRate) {
            x.AmountInTokens = this.globalRate.AmountInTokens;
            x.AmountInCurrency = this.globalRate.AmountInCurrency;
          }
        });

        this.dataSource = response.Partners;
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

  toggleSearchName() {
    this.isVisibleSearchName = !this.isVisibleSearchName;

    if (!this.isVisibleSearchName && this.searchNameValue) {
      this.searchNameValue = '';
      this.searchNameValueChanged();
    }
  }

  searchName() {
    this.isSearching = true;
    this.currentPage = 0;
    this.getData(this.pageSize, 1, this.searchNameValue);
  }

  searchNameValueChanged() {
    if (!this.searchNameValue) {
      this.clearName();
    }
  }

  clearName() {
    this.searchNameValue = '';
    this.isSearching = true;
    this.getData(this.pageSize, 1);
  }
}
