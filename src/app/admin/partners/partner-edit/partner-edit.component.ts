import {Component, OnInit, ViewChild, TemplateRef, ElementRef} from '@angular/core';
import {Partner} from '../models/partner.interface';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {PartnersService} from '../partners.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, ActivatedRoute} from '@angular/router';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {Provider} from '../models/provider.interface';
import {PaymentProvidersService} from '../services/payment-providers.service';
import {PartnerInfo} from '../models/partner-info.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {AuthenticationService} from 'src/app/authentication/authentication.service';

import {forkJoin} from 'rxjs';
@Component({
  selector: 'app-partner-edit',
  templateUrl: './partner-edit.component.html',
  styleUrls: ['./partner-edit.component.scss'],
})
export class PartnerEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  partnerId: string;
  partner: Partner;
  provider: Provider;
  isPartnerAdmin = false;
  FormMode = FormMode;
  isFormDisabled = false;
  loading = true;
  private previousPage = '';
  private previousPageSize = '';

  // Translates
  @ViewChild('headerTitle', {static: true})
  headerTitle: ElementRef<HTMLElement>;
  @ViewChild('headerTitleForPartner', {static: true})
  headerTitleForPartner: ElementRef<HTMLElement>;
  @ViewChild('successMessage', {static: true})
  successMessage: ElementRef<HTMLElement>;
  private translates = {
    headerTitle: '',
    successMessage: '',
  };

  constructor(
    private authenticationService: AuthenticationService,
    private partnersService: PartnersService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentProvidersService: PaymentProvidersService,
    private headerMenuService: HeaderMenuService
  ) {
    this.isPartnerAdmin = this.authenticationService.isPartnerAdmin();
  }

  ngOnInit() {
    this.translates.headerTitle = this.isPartnerAdmin
      ? this.headerTitle.nativeElement.innerText
      : this.headerTitleForPartner.nativeElement.innerText;

    this.headerMenuService.headerMenuContent = {
      title: this.translates.headerTitle,
      subHeaderContent: this.subHeaderTemplate,
    };

    this.translates.successMessage = this.successMessage.nativeElement.innerText;

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.partnerId = this.route.snapshot.params.id;

    forkJoin([this.partnersService.getById(this.partnerId), this.paymentProvidersService.getById(this.partnerId)]).subscribe(
      (result) => {
        this.partner = result[0];
        this.provider = result[1].PaymentProviderDetails[0];
        this.loading = false;
      },
      () => {
        this.navigateToList();
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000,
        });
      }
    );
  }

  onFormSubmit(partner: PartnerInfo) {
    this.isFormDisabled = true;
    this.loading = true;
    console.log(partner.partnerProviderDetails);
    partner.partnerProviderDetails.PartnerId = this.partnerId;
    forkJoin([
      this.partnersService.update({...this.partner, ...partner.partnerDetails}),
      this.paymentProvidersService.update({...this.provider, ...partner.partnerProviderDetails}),
    ]).subscribe(
      () => {
        this.snackBar.open(this.translates.successMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000,
        });

        this.navigateToList();
      },
      () => {
        this.loading = false;
        this.isFormDisabled = false;
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000,
        });
      }
    );
  }

  private navigateToList(): void {
    this.router.navigate(['/admin/platform/partners'], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize,
      },
    });
  }
}
