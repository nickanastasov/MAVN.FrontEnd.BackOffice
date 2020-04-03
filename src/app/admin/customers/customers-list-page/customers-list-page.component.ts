import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CustomerRow} from '../models/customer-row.interface';
import {CustomersService} from '../customers.service';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {MatSnackBar} from '@angular/material';
import {Subscription} from 'rxjs';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {CustomerAgentStatus} from '../models/customer-agent-status.enum';
import {ActivatedRoute} from '@angular/router';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-customers-list-page',
  templateUrl: './customers-list-page.component.html',
  styleUrls: ['./customers-list-page.component.scss']
})
export class CustomersListPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  initialPageSize: number;
  private pageSize: number;
  private getDataSubscription: Subscription;

  loading = true;
  isSearching: boolean;
  customers: CustomerRow[];
  totalCount: number;
  currentPage = 0;
  searchEmailValue: string = '';
  isVisibleSearchEmail: boolean;
  CustomerAgentStatus = CustomerAgentStatus;

  constructor(
    // services
    private customersService: CustomersService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {
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
      title: 'Customers',
      subHeaderContent: this.subHeaderTemplate
    };
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.currentPage = pageEvent.CurrentPage;
    this.pageSize = pageEvent.PageSize;

    if (this.searchEmailValue) {
      this.searchEmail();
    } else {
      this.loading = true;
      this.getData(this.pageSize, this.currentPage + 1);
    }
  }

  toggleSearchEmail() {
    this.isVisibleSearchEmail = !this.isVisibleSearchEmail;

    if (!this.isVisibleSearchEmail && this.searchEmailValue) {
      this.searchEmailValue = '';
      this.searchEmailValueChanged();
    }
  }

  searchEmail() {
    if (!this.searchEmailValue) {
      return;
    }

    this.isSearching = true;
    this.currentPage = 0;
    this.getData(this.pageSize, 1, this.searchEmailValue);
  }

  searchEmailValueChanged() {
    if (!this.searchEmailValue) {
      this.clearEmail();
    }
  }

  clearEmail() {
    this.searchEmailValue = '';
    this.isSearching = true;
    this.getData(this.pageSize, 1);
  }

  getData(pageSize: number, currentPage: number, searchValue: string = '') {
    if (this.getDataSubscription) {
      this.getDataSubscription.unsubscribe();
    }

    this.getDataSubscription = this.customersService.get(pageSize, currentPage, searchValue).subscribe(
      response => {
        this.customers = response.Customers;
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
