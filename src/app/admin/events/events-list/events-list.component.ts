import {OperationType} from './../models/operation-type';
import {Component, OnInit, TemplateRef, ViewChild, ElementRef} from '@angular/core';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {Event} from '../models/event.interface';
import {EventsService} from '../events.service';
import {EventParameters} from '../models/event-parameters.interface';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss'],
})
export class EventsListComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  pageSize = 0;
  currentPage = 0;
  totalCount = Infinity;
  operationEnum = OperationType;

  assetSymbol = TOKEN_SYMBOL;
  isLoading = true;
  isSearching = false;
  events: Event[] = [];
  filterRequest = {
    EventName: null as string,
    AffectedAddresses: [] as string[],
  };
  hasFiltering = false;

  @ViewChild('headerTitle', {static: true})
  headerTitle: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: '',
  };

  constructor(
    // services
    private eventsService: EventsService,
    private headerMenuService: HeaderMenuService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.translates.headerTitle = this.headerTitle.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate,
    };
  }

  private getData(pageSize: number, currentPage: number) {
    this.hasFiltering =
      !!this.filterRequest.EventName || !!(this.filterRequest.AffectedAddresses && this.filterRequest.AffectedAddresses.length);

    this.eventsService
      .getAll({
        ...this.filterRequest,
        PagedRequest: {
          PageSize: pageSize,
          CurrentPage: currentPage,
        },
      })
      .subscribe(
        (response) => {
          if (response.Events.length < this.pageSize) {
            this.totalCount = response.Events.length;
          } else {
            this.totalCount = Infinity;
          }

          response.Events.forEach((e) => {
            let from = null as EventParameters;
            let to = null as EventParameters;

            let amount = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'amount');
            amount = !!amount ? amount : e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'value');

            switch (e.EventName) {
              case OperationType.CustomerRegistered:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'customerid');
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'customeraddress');
                break;
              case OperationType.Minted:
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'to');
                break;
              case OperationType.Burned:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'from');
                break;
              case OperationType.StakeDecreased:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'account');
                amount = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'burntamount');
                break;
              case OperationType.StakeIncreased:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'account');
                break;
              case OperationType.SeizeFrom:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'account');
                break;
              case OperationType.TransferredFromPublicNetwork:
              case OperationType.PublicAccountUnlinked:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'publicaccount');
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'internalaccount');
                break;
              case OperationType.TransferredToPublicNetwork:
              case OperationType.PublicAccountLinked:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'internalaccount');
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'publicaccount');
                break;
              case OperationType.RoleAdded:
              case OperationType.TreasuryAccountSet:
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'account');
                break;
              case OperationType.TransferAccepted:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'from');
                break;
              default:
                from = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'from');
                to = e.Parameters.find((p) => p.Name.toLocaleLowerCase() === 'to');
                break;
            }

            e.From = !!from ? from.Value : '-';
            e.To = !!to ? to.Value : '-';
            e.Amount = !!amount ? amount.Value : '-';
          });

          this.events = response.Events;
          this.isLoading = false;
          this.isSearching = false;
        },
        (error) => {
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
}
