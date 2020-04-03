import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TransactionsService} from '../transactions.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {MatTableDataSource, MatSnackBar} from '@angular/material';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {Transaction} from '../models/transaction.interface';
import {Moment} from 'moment';
import * as moment from 'moment';
import {DATE_ONLY_FORMAT} from '../../dashboard/models/chart-constants';
import {saveAs} from 'file-saver';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  pageSize = 0;
  currentPage = 0;
  totalCount = Infinity;
  assetSymbol = TOKEN_SYMBOL;
  isLoading = true;
  isSearching = false;
  transactions: Transaction[] = [];
  dataSource: MatTableDataSource<Transaction>;
  timestampFromDate: Moment = moment.utc().add(-6, 'd');
  timestampToDate: Moment = moment.utc();
  periodMaxDate: Moment = moment.utc();
  isExporting: boolean;

  constructor(
    // services
    private snackBar: MatSnackBar,
    private transactionsService: TransactionsService,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Transactions',
      subHeaderContent: this.subHeaderTemplate
    };
  }

  private getData(pageSize: number, currentPage: number) {
    this.transactionsService
      .getAll({
        From: this.timestampFromDate.format(DATE_ONLY_FORMAT),
        To: this.timestampToDate.format(DATE_ONLY_FORMAT),
        PageSize: pageSize,
        CurrentPage: currentPage
      })
      .subscribe(
        transactions => {
          if (transactions.Items.length < this.pageSize) {
            this.totalCount = transactions.Items.length;
          } else {
            this.totalCount = Infinity;
          }

          this.transactions = transactions.Items;
          this.isLoading = false;
          this.isSearching = false;
        },
        error => {
          this.isLoading = false;
          this.isSearching = false;
          console.error(error);
          this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        }
      );
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

    const from = this.timestampFromDate.format(DATE_ONLY_FORMAT);
    const to = this.timestampToDate.format(DATE_ONLY_FORMAT);

    this.transactionsService.exportToCsv(from, to).subscribe(
      blobResponse => {
        this.isExporting = false;
        const blobObject = new Blob([blobResponse], {type: 'text/csv'});
        const filename = `transactions_from_${from}_to_${to}.csv`;
        saveAs(blobObject, filename);
      },
      error => {
        this.isExporting = false;
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }
}
