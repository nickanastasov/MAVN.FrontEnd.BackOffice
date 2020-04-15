import {ROUTE_SMART_VOUCHERS} from './../../../core/constants/routes';
import {SmartVoucherService} from './../smart-voucher.service';
import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {SpendActionRuleService} from './../../spend-action-rule/spend-action-rule.service';
import {SpendActionRule} from './../../spend-action-rule/models/spend-action-rule.interface';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ImageAddRequest} from '../../action-rule/models/image-add-request.interface';
import {ImageContentCreatedResponse} from '../../action-rule/models/image-content-created-response.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {ROUTE_ADMIN_ROOT} from 'src/app/core/constants/routes';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {SmartVoucher} from '../models/smart-voucher.interface';

@Component({
  selector: 'app-smart-voucher-add',
  templateUrl: './smart-voucher-add.component.html',
  styleUrls: ['./smart-voucher-add.component.scss']
})
export class SmartVoucherAddComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isLoading: boolean;

  @ViewChild('successMessageElement')
  successMessageElement: ElementRef;

  @ViewChild('headerTitle')
  headerTitle: ElementRef;
  successMessage: string;

  spendActionRule: SpendActionRule;
  private previousPage: string;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private spendActionRuleService: SpendActionRuleService,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService,
    private smartVoucherService: SmartVoucherService
  ) {}

  ngOnInit() {
    const translates = this.translateService.globalTranslates;
    translates.CampaignSubHeaderTitle = this.headerTitle.nativeElement.innerText;
    this.previousPage = window.history.state.page;
    // this.successMessage = (this.successMessageElement.nativeElement as HTMLElement).innerText;

    this.headerMenuService.headerMenuContent = {
      title: translates.CampaignSubHeaderTitle,
      subHeaderContent: this.subHeaderTemplate
    };
  }

  onFormSubmit(formData: any) {
    this.isLoading = true;

    this.smartVoucherService.create(formData).subscribe(
      response => {
        formData.Id = response.Id;
        this.saveImages(formData, response.CreatedImageContents);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
      }
    );
  }

  private saveImages(formData: SmartVoucher, createdImageContents: ImageContentCreatedResponse[]) {
    const mobileContentsWithImages = formData.LocalizedContents.filter(mobContent => mobContent.File && mobContent.File.size > 0);

    const requests = mobileContentsWithImages.map(mobContent => {
      const createdImageContent = createdImageContents.find(val => val.MobileLanguage === mobContent.MobileLanguage);

      const model: ImageAddRequest = {
        RuleContentId: createdImageContent ? createdImageContent.RuleContentId : ''
      };

      return this.spendActionRuleService.addImage(model, mobContent.File);
    });

    if (requests.length) {
      forkJoin(requests).subscribe(
        () => {
          this.uploadVouchers(formData);
        },
        error => {
          console.error(error);

          this.snackBar.open(
            this.translateService.translates.ErrorImageUploadMessage,
            this.translateService.translates.CloseSnackbarBtnText,
            {
              duration: 5000
            }
          );
        }
      );
    } else {
      this.uploadVouchers(formData);
    }
  }

  private uploadVouchers(formData: SpendActionRule) {
    if (formData.VouchersFile && formData.VouchersFile.size > 0) {
      this.spendActionRuleService.uploadVouchers(formData.Id, formData.VouchersFile).subscribe(
        () => {
          this.handleSuccess();
        },
        ({error}) => {
          let errorMessage = 'Error occured during vouchers upload, please check the content of the file and try again or contact support.';

          if (error && error.error === 'CodeAlreadyExist') {
            errorMessage =
              'Error occured during vouchers upload: some of voucher codes have been uploaded earlier, please check the content of the file and try again or contact support.';
          }

          this.snackBar.open(errorMessage, this.translateService.translates.CloseSnackbarBtnText);

          this.router.navigate([`${ROUTE_ADMIN_ROOT}/${ROUTE_SPEND_RULES}/${ROUTE_EDIT_SPEND_RULE}/${formData.Id}`]);
        }
      );
    } else {
      this.handleSuccess();
    }
  }

  private handleSuccess() {
    this.snackBar.open(this.successMessage, this.translateService.translates.CloseSnackbarBtnText, {
      duration: 5000
    });

    this.router.navigate([`${ROUTE_ADMIN_ROOT}/${ROUTE_SMART_VOUCHERS}`], {
      queryParams: {
        page: this.previousPage
      }
    });
  }
}
