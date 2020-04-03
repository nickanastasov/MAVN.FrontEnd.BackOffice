import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {Payment} from '../models/payment.interface';
import {PageRequestModel} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {PaymentGatewayService} from '../payment-gateway.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationDialogComponent} from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogData} from 'src/app/shared/confirmation-dialog/confirmation-dialog-data.interface';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {SettingsService} from 'src/app/core/settings/settings.service';

@Component({
  selector: 'app-payment-gateway-list',
  templateUrl: './payment-gateway-list.component.html',
  styleUrls: ['./payment-gateway-list.component.scss']
})
export class PaymentGatewayListComponent implements OnInit {
  tokenSymbol = TOKEN_SYMBOL;
  baseCurrencyCode: string;
  isLoading = true;
  payments: Payment[] = [];
  totalCount: number;
  currentPage = 0;
  private pageSize: number;
  private getDataSubscription: Subscription;

  // #region translates
  @ViewChild('approveDialogHeaderTemplate')
  approveDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('approveDialogMessageTemplate')
  approveDialogMessageTemplate: ElementRef<HTMLElement>;
  @ViewChild('dialogButtonCancelTextTemplate')
  dialogButtonCancelTextTemplate: ElementRef<HTMLElement>;
  @ViewChild('approveDialogButtonConfirmTextTemplate')
  approveDialogButtonConfirmTextTemplate: ElementRef<HTMLElement>;
  @ViewChild('approveSuccessMessageTemplate')
  approveSuccessMessageTemplate: ElementRef<HTMLElement>;
  @ViewChild('rejectDialogHeaderTemplate')
  rejectDialogHeaderTemplate: ElementRef<HTMLElement>;
  @ViewChild('rejectDialogMessageTemplate')
  rejectDialogMessageTemplate: ElementRef<HTMLElement>;
  @ViewChild('rejectDialogButtonConfirmTextTemplate')
  rejectDialogButtonConfirmTextTemplate: ElementRef<HTMLElement>;
  @ViewChild('rejectSuccessMessageTemplate')
  rejectSuccessMessageTemplate: ElementRef<HTMLElement>;
  private translates = {
    approveDialogHeader: '',
    approveDialogMessage: '',
    dialogButtonCancelText: '',
    approveDialogButtonConfirmText: '',
    approveSuccessMessage: '',
    rejectDialogHeader: '',
    rejectDialogMessage: '',
    rejectDialogButtonConfirmText: '',
    rejectSuccessMessage: ''
  };
  // #endregion

  // tslint:disable-next-line: prettier
  constructor(
    private settingsService: SettingsService,
    private paymentGatewayService: PaymentGatewayService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
  }

  ngOnInit(): void {
    // translates
    this.translates.approveDialogHeader = this.approveDialogHeaderTemplate.nativeElement.innerText;
    this.translates.approveDialogMessage = this.approveDialogMessageTemplate.nativeElement.innerText;
    this.translates.dialogButtonCancelText = this.dialogButtonCancelTextTemplate.nativeElement.innerText;
    this.translates.approveDialogButtonConfirmText = this.approveDialogButtonConfirmTextTemplate.nativeElement.innerText;
    this.translates.approveSuccessMessage = this.approveSuccessMessageTemplate.nativeElement.innerText;
    this.translates.rejectDialogHeader = this.rejectDialogHeaderTemplate.nativeElement.innerText;
    this.translates.rejectDialogMessage = this.rejectDialogMessageTemplate.nativeElement.innerText;
    this.translates.rejectDialogButtonConfirmText = this.rejectDialogButtonConfirmTextTemplate.nativeElement.innerText;
    this.translates.rejectSuccessMessage = this.rejectSuccessMessageTemplate.nativeElement.innerText;
  }

  onPaginationChangeEvent(pageEvent: PageRequestModel) {
    this.pageSize = pageEvent.PageSize;
    this.currentPage = pageEvent.CurrentPage;

    this.load();
  }

  load() {
    this.isLoading = true;
    this.getData(this.pageSize, this.currentPage + 1);
  }

  getData(pageSize: number, currentPage: number) {
    if (this.getDataSubscription) {
      this.getDataSubscription.unsubscribe();
    }

    this.getDataSubscription = this.paymentGatewayService.getAll(pageSize, currentPage).subscribe(
      response => {
        this.payments = response.Items;
        this.totalCount = response.PagedResponse.TotalCount;
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  approve(paymentId: string) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.approveDialogHeader,
        Message: this.translates.approveDialogMessage,
        ButtonCancelText: this.translates.dialogButtonCancelText,
        ButtonConfirmText: this.translates.approveDialogButtonConfirmText
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        this.paymentGatewayService.approve(paymentId).subscribe(
          () => {
            this.snackBar.open(this.translates.approveSuccessMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000
            });

            this.load();
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }

  reject(paymentId: string) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        Header: this.translates.rejectDialogHeader,
        Message: this.translates.rejectDialogMessage,
        ButtonCancelText: this.translates.dialogButtonCancelText,
        ButtonConfirmText: this.translates.rejectDialogButtonConfirmText
      } as ConfirmationDialogData
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        this.paymentGatewayService.decline(paymentId).subscribe(
          () => {
            this.snackBar.open(this.translates.rejectSuccessMessage, this.translateService.translates.CloseSnackbarBtnText, {
              duration: 5000
            });

            this.load();
          },
          () => {
            this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
          }
        );
      }
    });
  }
}
