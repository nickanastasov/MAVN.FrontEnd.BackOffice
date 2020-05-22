import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {Component, OnInit, TemplateRef, ViewChild, ElementRef} from '@angular/core';
import {TransactionsService} from '../transactions.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {Transaction} from '../models/transaction.interface';
import {Moment} from 'moment';
import * as moment from 'moment';
import {DATE_ONLY_FORMAT} from '../../dashboard/models/chart-constants';
import {saveAs} from 'file-saver';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {FormBuilder} from '@angular/forms';
import {PartnersService} from '../../partners/partners.service';
import {PartnerRowResponse} from '../../partners/models/partner-row.interface';
import * as constants from 'src/app/core/constants/const';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
})
export class TransactionsListComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  pageSize = 0;
  businessVerticals: string[] = [];
  currentPage = 0;
  totalCount = Infinity;
  baseCurrencyCode: string;
  assetSymbol = TOKEN_SYMBOL;
  isLoading = true;
  isSearching = false;
  transactions: Transaction[] = [];
  dataSource: MatTableDataSource<Transaction>;
  timestampFromDate: Moment = moment.utc().add(-6, 'd');
  timestampToDate: Moment = moment.utc();
  periodMaxDate: Moment = moment.utc();
  isExporting: boolean;

  @ViewChild('headerTitle', {static: true})
  headerTitle: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: '',
  };

  partnerFormProps = {
    PartnerId: 'PartnerId',
    PartnersSearch: 'PartnersSearch',
  };
  partnerForm = this.fb.group({
    [this.partnerFormProps.PartnerId]: [null],
    [this.partnerFormProps.PartnersSearch]: [null],
  });
  isLoadingPartners = false;
  partners: PartnerRowResponse[] = [];
  isPartnerAdmin = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private partnersService: PartnersService,
    private settingsSetvice: SettingsService,
    private snackBar: MatSnackBar,
    private transactionsService: TransactionsService,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {
    this.isPartnerAdmin = this.authenticationService.isPartnerAdmin();
    this.baseCurrencyCode = this.settingsSetvice.baseCurrencyCode;
  }

  ngOnInit() {
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate,
    };

    this.loadAllPartners();
  }

  private getData(pageSize: number, currentPage: number) {
    this.transactionsService
      .getAll({
        From: this.timestampFromDate.format(DATE_ONLY_FORMAT),
        To: this.timestampToDate.format(DATE_ONLY_FORMAT),
        PartnerId: this.partnerForm.get(this.partnerFormProps.PartnerId).value,
        PageSize: pageSize,
        CurrentPage: currentPage,
      })
      .subscribe(
        (transactions) => {
          if (transactions.Items.length < this.pageSize) {
            this.totalCount = transactions.Items.length;
          } else {
            this.totalCount = Infinity;
          }

          this.transactions = transactions.Items;
          this.isLoading = false;
          this.isSearching = false;
          this.removeBusinessUnitDuplicate();
        },
        (error) => {
          this.isLoading = false;
          this.isSearching = false;
          console.error(error);
          this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        }
      );
  }
  removeBusinessUnitDuplicate() {
    this.transactions.forEach((obj) => {
      if (!this.businessVerticals.includes(obj.Vertical)) {
        this.businessVerticals.push(obj.Vertical);
      }
    });
  }

  onFilter() {
    this.currentPage = 0;
    this.isSearching = true;
    this.getData(this.pageSize, this.currentPage + 1);
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.pageSize = pageEvent.PageSize;
    this.currentPage = pageEvent.CurrentPage;

    this.isLoading = true;
    this.getData(this.pageSize, this.currentPage + 1);
  }

  exportToCsv() {
    this.isExporting = true;

    const model = {
      From: this.timestampFromDate.format(DATE_ONLY_FORMAT),
      To: this.timestampToDate.format(DATE_ONLY_FORMAT),
      PartnerId: this.partnerForm.get(this.partnerFormProps.PartnerId).value,
    };

    this.transactionsService.exportToCsv(model).subscribe(
      (blobResponse) => {
        this.isExporting = false;
        const blobObject = new Blob([blobResponse], {type: 'text/csv'});
        const filename = `transactions_from_${model.From}_to_${model.To}.csv`;
        saveAs(blobObject, filename);
      },
      (error) => {
        this.isExporting = false;
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  // #region Partners

  private loadAllPartners() {
    this.isLoadingPartners = true;

    const page = 1;
    this.loadPagedPartners(page);
  }

  private loadPagedPartners(page: number) {
    this.partnersService.getAll(constants.MAX_PAGE_SIZE, page, '').subscribe(
      (response) => {
        this.partners = [...this.partners, ...response.Partners];

        if (this.partners.length >= response.PagedResponse.TotalCount) {
          this.partners = this.partners.sort((a, b) => (a.Name > b.Name ? 1 : -1));
          this.isLoadingPartners = false;
        } else {
          page++;
          this.loadPagedPartners(page);
        }
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isLoadingPartners = false;
      }
    );
  }

  // #endregion Partners
}
