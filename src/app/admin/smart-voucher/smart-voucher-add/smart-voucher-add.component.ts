import {ROUTE_SMART_VOUCHERS} from './../../../core/constants/routes';
import {SmartVoucherService} from './../smart-voucher.service';
import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ImageContentCreatedResponse} from '../../action-rule/models/image-content-created-response.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {ROUTE_ADMIN_ROOT} from 'src/app/core/constants/routes';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {SmartVoucher} from '../models/smart-voucher.interface';
import {SmartVoucherCampaignSetImageRequest} from '../models/set-image-request.interface';

@Component({
  selector: 'app-smart-voucher-add',
  templateUrl: './smart-voucher-add.component.html',
  styleUrls: ['./smart-voucher-add.component.scss'],
})
export class SmartVoucherAddComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isLoading: boolean;

  @ViewChild('successMessageElement')
  successMessageElement: ElementRef;

  @ViewChild('headerTitle')
  headerTitle: ElementRef;
  successMessage: string;
  private previousPage: string;
  private previousPageSize = '';

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService,
    private smartVoucherService: SmartVoucherService
  ) {}

  ngOnInit() {
    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;

    const headerTitle = this.headerTitle.nativeElement.innerText;
    this.successMessage = (this.successMessageElement.nativeElement as HTMLElement).innerText;

    this.headerMenuService.headerMenuContent = {
      title: headerTitle,
      subHeaderContent: this.subHeaderTemplate,
    };
  }

  onFormSubmit(formData: any) {
    this.isLoading = true;

    this.smartVoucherService.create(formData).subscribe(
      (response) => {
        formData.Id = response.Id;
        this.saveImages(formData, response.CreatedImageContents);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000,
        });
      }
    );
  }

  private saveImages(formData: SmartVoucher, createdImageContents: ImageContentCreatedResponse[]) {
    const mobileContentsWithImages = formData.MobileContents.filter((mobContent) => mobContent.File && mobContent.File.size > 0);

    const requests = mobileContentsWithImages.map((mobContent) => {
      const createdImageContent = createdImageContents.find((val) => val.MobileLanguage === mobContent.MobileLanguage);

      const model: SmartVoucherCampaignSetImageRequest = {
        ContentId: createdImageContent ? createdImageContent.RuleContentId : '',
        CampaignId: formData.Id,
        Localization: createdImageContent ? createdImageContent.MobileLanguage : '',
      };

      return this.smartVoucherService.setImage(model, mobContent.File);
    });

    if (requests.length) {
      forkJoin(requests).subscribe(
        () => {
          this.handleSuccess();
        },
        (error) => {
          console.error(error);

          this.snackBar.open(
            this.translateService.translates.ErrorImageUploadMessage,
            this.translateService.translates.CloseSnackbarBtnText,
            {
              duration: 5000,
            }
          );
        }
      );
    } else {
      this.handleSuccess();
    }
  }

  private handleSuccess() {
    this.snackBar.open(this.successMessage, this.translateService.translates.CloseSnackbarBtnText, {
      duration: 5000,
    });

    this.router.navigate([`${ROUTE_ADMIN_ROOT}/${ROUTE_SMART_VOUCHERS}`], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize,
      },
    });
  }
}
