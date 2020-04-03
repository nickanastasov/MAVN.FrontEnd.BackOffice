import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {CustomersService} from '../customers.service';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar, MatDialog} from '@angular/material';
import {CustomerOperation} from '../models/customer-operation.interface';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {Balance} from '../models/balance.interface';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {CustomerDetails} from '../models/customer-details.interface';
import {CustomerActivityStatus} from '../models/customer-activity-status.enum';
import {CustomerWalletActivityStatus} from '../models/customer-wallet-activity-status.enum';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {CustomerAgentStatus} from '../models/customer-agent-status.enum';
import {CustomerOperationTransactionType} from '../models/customer-operation-transaction-type.enum';
import {CustomerPublicWalletAddressStatus} from '../models/customer-public-wallet-address-status.enum';
import {PermissionType} from '../../user/models/permission-type.enum';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-customer-details-page',
  templateUrl: './customer-details-page.component.html',
  styleUrls: ['./customer-details-page.component.scss']
})
export class CustomerDetailsPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  customerId: string;
  customer: CustomerDetails;
  CustomerAgentStatus = CustomerAgentStatus;
  balance: Balance;
  walletAddress: string;
  publicWalletAddress: string;
  publicWalletAddressStatus: CustomerPublicWalletAddressStatus;
  CustomerPublicWalletAddressStatus = CustomerPublicWalletAddressStatus;
  customerOperations: CustomerOperation[];
  CustomerOperationTransactionType = CustomerOperationTransactionType;
  customerOperationsCurrentPage = 0;
  customerOperationsTotalCount: number;
  isCustomerVerified: boolean;
  campaignsTableDisplayedColumns: string[] = ['id', 'date', 'transactionType', 'campaignName', 'walletAddress', 'amount'];
  get isLoading(): boolean {
    return this.isLoadingCustomer || this.isLoadingCustomerOperations;
  }
  isLoadingCustomer = true;
  isLoadingCustomerOperations = true;
  isLoadingCustomerOperationsAtFirstTime = true;
  isLoadingBalance = true;
  isLoadingWalletAddress = true;
  isLoadingPublicWalletAddress = true;
  isVisiblePublicWalletAddress = true;
  hasLoadingError = false;
  isCustomerBlocked = false;
  isWalletBlocked = false;
  isProcessingCustomer = false;
  isProcessingWallet = false;
  previousPage = '';
  previousPageSize = '';
  // copy to clipboard
  copyToClipboardText = '';
  copyModalLeft = 0;
  copyModalTop = 0;
  isVisibleCopyModal = false;

  // #region translates
  //Block Access
  @ViewChild('blockAccessDialogHeaderTemplate')
  blockAccessDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('blockAccessDialogMessageTemplate')
  blockAccessDialogMessageTemplate: ElementRef<HTMLElement>;

  //Block Wallet
  @ViewChild('blockWalletDialogHeaderTemplate')
  blockWalletDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('blockWalletDialogMessageTemplate')
  blockWalletDialogMessageTemplate: ElementRef<HTMLElement>;

  //Unblock Access
  @ViewChild('unblockAccessDialogHeaderTemplate')
  unblockAccessDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('unblockAccessDialogMessageTemplate')
  unblockAccessDialogMessageTemplate: ElementRef<HTMLElement>;

  //Unblock Wallet
  @ViewChild('unblockWalletDialogHeaderTemplate')
  unblockWalletDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('unblockWalletDialogMessageTemplate')
  unblockWalletDialogMessageTemplate: ElementRef<HTMLElement>;

  private translates = {
    blockAccessDialogHeader: '',
    blockAccessDialogMessage: '',
    blockWalletDialogHeader: '',
    blockWalletDialogMessage: '',
    unblockAccessDialogHeader: '',
    unblockAccessDialogMessage: '',
    unblockWalletDialogHeader: '',
    unblockWalletDialogMessage: ''
  };
  // #endregion
  hasEditPermission = false;

  constructor(
    private authenticationService: AuthenticationService,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.Customers].Edit;
    this.isVisiblePublicWalletAddress = !this.settingsService.IsPublicBlockchainFeatureDisabled;
  }

  ngOnInit() {
    // translates
    this.translates.blockAccessDialogHeader = this.blockAccessDialogHeaderTemplate.nativeElement.innerText;
    this.translates.blockAccessDialogMessage = this.blockAccessDialogMessageTemplate.nativeElement.innerText;
    this.translates.blockWalletDialogHeader = this.blockWalletDialogHeaderTemplate.nativeElement.innerText;
    this.translates.blockWalletDialogMessage = this.blockWalletDialogMessageTemplate.nativeElement.innerText;

    this.translates.unblockAccessDialogHeader = this.unblockAccessDialogHeaderTemplate.nativeElement.innerText;
    this.translates.unblockAccessDialogMessage = this.unblockAccessDialogMessageTemplate.nativeElement.innerText;
    this.translates.unblockWalletDialogHeader = this.unblockWalletDialogHeaderTemplate.nativeElement.innerText;
    this.translates.unblockWalletDialogMessage = this.unblockWalletDialogMessageTemplate.nativeElement.innerText;

    this.customerId = this.route.snapshot.paramMap.get('id');

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;

    this.customersService.getBalance(this.customerId).subscribe(
      balance => {
        this.balance = balance;
        this.isLoadingBalance = false;
      },
      () => {
        this.handleLoadingError();
      }
    );

    this.headerMenuService.headerMenuContent = {
      title: 'Customers',
      subHeaderContent: this.subHeaderTemplate
    };

    this.customersService.getCustomerById(this.customerId).subscribe(
      customer => {
        if (customer) {
          this.customer = customer;
          this.isCustomerVerified = customer.IsPhoneVerified && customer.IsEmailVerified;

          if (customer.CustomerStatus == CustomerActivityStatus.Blocked) {
            this.isCustomerBlocked = true;
          }

          if (customer.WalletStatus == CustomerWalletActivityStatus.Blocked) {
            this.isWalletBlocked = true;
          }
        }

        this.isLoadingCustomer = false;
      },
      () => {
        this.handleLoadingError();
      }
    );

    this.customersService.getWalletAddress(this.customerId).subscribe(
      res => {
        this.walletAddress = res.WalletAddress;
        this.isLoadingWalletAddress = false;
      },
      () => {
        this.handleLoadingError();
      }
    );

    if (!this.settingsService.IsPublicBlockchainFeatureDisabled) {
      this.getPublicWalletAddress();
    }
  }

  private getPublicWalletAddress(): void {
    this.customersService.getPublicWalletAddress(this.customerId).subscribe(
      res => {
        this.publicWalletAddress = res.PublicAddress;
        this.publicWalletAddressStatus = res.Status;
        this.isLoadingPublicWalletAddress = false;
      },
      () => {
        this.handleLoadingError();
      }
    );
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.customerOperationsCurrentPage = pageEvent.CurrentPage;

    this.loadOperations(pageEvent.PageSize, this.customerOperationsCurrentPage + 1);
  }

  private loadOperations(pageSize: number, currentPage: number) {
    this.isLoadingCustomerOperations = true;

    this.customersService.getCustomerOperationsById(pageSize, currentPage, this.customerId).subscribe(
      response => {
        if (response) {
          this.customerOperations = response.Operations;
          this.customerOperationsTotalCount = response.PagedResponse.TotalCount;
        }

        this.isLoadingCustomerOperationsAtFirstTime = false;
        this.isLoadingCustomerOperations = false;
      },
      () => {
        this.handleLoadingError();
      }
    );
  }

  private handleLoadingError() {
    if (this.hasLoadingError) {
      return;
    }

    this.hasLoadingError = true;
    this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
  }

  openFullText(event: {target: HTMLInputElement}, text: string) {
    this.copyToClipboardText = text;

    const rect = event.target.getBoundingClientRect();
    const tdPadding = 8;
    this.copyModalLeft = rect.left - tdPadding;
    this.copyModalTop = rect.top - tdPadding;

    this.isVisibleCopyModal = true;
  }

  closeCopyModal() {
    this.isVisibleCopyModal = false;
  }

  blockCustomer() {
    if (!this.hasEditPermission) {
      return;
    }

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.blockAccessDialogHeader,
        Message: this.translates.blockAccessDialogMessage
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isProcessingCustomer = true;

        this.customersService.blockCustomer(this.customerId).subscribe(
          () => {
            this.isCustomerBlocked = true;
            this.isProcessingCustomer = false;
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }

  unblockCustomer() {
    if (!this.hasEditPermission) {
      return;
    }

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.unblockAccessDialogHeader,
        Message: this.translates.unblockAccessDialogMessage
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isProcessingCustomer = true;

        this.customersService.unblockCustomer(this.customerId).subscribe(
          () => {
            this.isCustomerBlocked = false;

            this.isProcessingCustomer = false;
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }

  blockWallet() {
    if (!this.hasEditPermission) {
      return;
    }

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.blockWalletDialogHeader,
        Message: this.translates.blockWalletDialogMessage
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isProcessingWallet = true;
        this.customersService.blockWallet(this.customerId).subscribe(
          () => {
            this.isWalletBlocked = true;
            this.isProcessingWallet = false;
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }

  unblockWallet() {
    if (!this.hasEditPermission) {
      return;
    }

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.unblockWalletDialogHeader,
        Message: this.translates.unblockWalletDialogMessage
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isProcessingWallet = true;
        this.customersService.unblockWallet(this.customerId).subscribe(
          () => {
            this.isWalletBlocked = false;
            this.isProcessingWallet = false;
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }
}
