import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {Partner} from '../models/partner.interface';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {PartnersService} from '../partners.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, ActivatedRoute} from '@angular/router';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {Provider} from '../models/provider.interface';
import {PaymentProvidersService} from '../services/payment-providers.service';
import {PartnerInfo} from '../models/partner-info.interface';

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
  FormMode = FormMode;
  isFormDisabled = false;
  loading = true;
  private previousPage = '';
  private previousPageSize = '';

  constructor(
    private partnersService: PartnersService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService,
    private paymentProvidersService: PaymentProvidersService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit Partner',
      subHeaderContent: this.subHeaderTemplate,
    };

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
        this.router.navigate(['/admin/platform/partners']);

        this.snackBar.open('Something went wrong. Please try again', 'Close', {
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
        this.snackBar.open('You have edited partner successfully ', 'Close', {
          duration: 5000,
        });

        this.router.navigate(['/admin/platform/partners'], {
          queryParams: {
            page: this.previousPage,
            pageSize: this.previousPageSize,
          },
        });
      },
      () => {
        this.loading = false;
        this.isFormDisabled = false;
        this.snackBar.open('Something went wrong. Please try again', 'Close', {
          duration: 5000,
        });
      }
    );
  }
}
