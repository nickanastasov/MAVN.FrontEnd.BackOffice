import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {forkJoin} from 'rxjs';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {DeepCopy} from 'src/app/shared/utils/common';
import {ROUTE_ADMIN_ROOT, ROUTE_SMART_VOUCHERS} from 'src/app/core/constants/routes';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';
import {SmartVoucherService} from '../smart-voucher.service';
import {SmartVoucher} from '../models/smart-voucher.interface';
import {SmartVoucherCampaignSetImageRequest} from '../models/set-image-request.interface';

@Component({
  selector: 'app-smart-voucher-edit',
  templateUrl: './smart-voucher-edit.component.html',
  styleUrls: ['./smart-voucher-edit.component.scss']
})
export class SmartVoucherEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  campaignId: string;
  campaignForEdit: SmartVoucher;
  FormMode = FormMode;
  isLoading = true;
  isSaving = false;
  private campaign: SmartVoucher;
  private previousPage = '';
  private previousPageSize = '';

  // translates
  @ViewChild('successMessageElement')
  successMessageElement: ElementRef;
  successMessage: string;

  constructor(
    private smartVoucherService: SmartVoucherService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit Voucher Campaign',
      subHeaderContent: this.subHeaderTemplate
    };

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.campaignId = this.route.snapshot.params.id;
    this.smartVoucherService.getById(this.campaignId).subscribe(
      res => {
        this.campaign = res as any;
        this.campaignForEdit = DeepCopy(res);
        this.isLoading = false;
      },
      () => {
        this.navigateToList();

        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
      }
    );

    this.successMessage = (this.successMessageElement.nativeElement as HTMLElement).innerText;
  }

  onFormSubmit(formData: SmartVoucher) {
    this.isSaving = true;

    const editModel = {...this.campaign, ...formData};

    if (editModel.MobileContents !== this.campaign.MobileContents) {
      const editedLocalizedContentsDictinary: any = editModel.MobileContents.reduce(
        (obj: {[key: string]: ActionRuleMobileContent}, item: any) => {
          obj[item.MobileLanguage] = item;
          return obj;
        },
        {}
      );

      this.campaign.MobileContents.forEach((mobContent: any) => {
        const editedMobContent = editedLocalizedContentsDictinary[mobContent.MobileLanguage];

        if (editedMobContent) {
          mobContent.Title = editedMobContent.Title;
          mobContent.Description = editedMobContent.Description;
          mobContent.ImageBlobUrl = editedMobContent.ImageBlobUrl;
        }
      });
    }

    editModel.MobileContents = this.campaign.MobileContents;

    this.smartVoucherService.edit(editModel).subscribe(
      () => {
        this.saveImages(formData);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private saveImages(formData: SmartVoucher) {
    const mobileContentsWithImages = formData.MobileContents.filter(mobContent => mobContent.File && mobContent.File.size > 0);

    if (mobileContentsWithImages.length) {
      const requests = mobileContentsWithImages.map(mobContent => {
        const existingMobContent = this.campaign.MobileContents.find((val: any) => val.MobileLanguage === mobContent.MobileLanguage);

        const model: SmartVoucherCampaignSetImageRequest = {
          ContentId: existingMobContent ? existingMobContent.ImageId : '',
          CampaignId: this.campaignId,
          Localization: existingMobContent ? existingMobContent.MobileLanguage : ''
        };

        return this.smartVoucherService.setImage(model, mobContent.File);
      });

      forkJoin(requests).subscribe(
        () => {
          this.handleSuccess();
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
      this.handleSuccess();
    }
  }

  private handleSuccess() {
    this.snackBar.open(this.successMessage, this.translateService.translates.CloseSnackbarBtnText, {
      duration: 5000
    });

    this.navigateToList();
  }

  private navigateToList() {
    this.router.navigate([`${ROUTE_ADMIN_ROOT}/${ROUTE_SMART_VOUCHERS}`], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize
      }
    });
  }
}
