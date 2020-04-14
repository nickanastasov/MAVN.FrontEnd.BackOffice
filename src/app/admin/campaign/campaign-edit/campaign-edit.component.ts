import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CampaignFormType} from '../campaign-form/campaign-form-type.enum';
import {Campaign} from '../models/campaign.interface';
import {CampaignService} from '../campaign.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {ImageEditRequest} from '../../action-rule/models/image-edit-request.interface';
import {forkJoin} from 'rxjs';
import {ImageAddRequest} from '../../action-rule/models/image-add-request.interface';
import {DeepCopy} from 'src/app/shared/utils/common';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-campaign-edit',
  templateUrl: './campaign-edit.component.html',
  styleUrls: ['./campaign-edit.component.scss']
})
export class CampaignEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  campaignId: string;
  campaignForEdit: Campaign;
  CampaignFormType = CampaignFormType;
  isLoading = true;
  isSaving = false;
  private previousPage = '';
  private previousPageSize = '';
  private campaign: Campaign;

  constructor(
    private campaignService: CampaignService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit Earn Campaign',
      subHeaderContent: this.subHeaderTemplate
    };

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.campaignId = this.route.snapshot.params.id;
    this.campaignService.getById(this.campaignId).subscribe(
      campaign => {
        this.campaign = campaign;
        this.campaignForEdit = DeepCopy(campaign) as Campaign;
        this.isLoading = false;
      },
      () => {
        this.router.navigate(['/admin/platform/earn-action-rules']);

        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  onFormSubmit(formData: Campaign) {
    this.isSaving = true;

    const editModel = {...this.campaign, ...formData} as Campaign;

    if (editModel.MobileContents !== this.campaign.MobileContents) {
      const editedMobileContentsDictinary: any = editModel.MobileContents.reduce((obj: {[key: string]: ActionRuleMobileContent}, item) => {
        obj[item.MobileLanguage] = item;
        return obj;
      }, {});

      this.campaign.MobileContents.forEach(mobContent => {
        const editedMobContent = editedMobileContentsDictinary[mobContent.MobileLanguage];

        if (editedMobContent) {
          mobContent.Title = editedMobContent.Title;
          mobContent.Description = editedMobContent.Description;
          mobContent.ImageBlobUrl = editedMobContent.ImageBlobUrl;
        }
      });
    }

    editModel.MobileContents = this.campaign.MobileContents;

    this.campaignService.edit(editModel).subscribe(
      () => {
        this.saveImages(formData);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private saveImages(formData: Campaign) {
    const mobileContentsWithImages = formData.MobileContents.filter(mobContent => mobContent.File && mobContent.File.size > 0);

    if (mobileContentsWithImages.length) {
      const requests = mobileContentsWithImages.map(mobContent => {
        const existingMobContent = this.campaign.MobileContents.find(val => val.MobileLanguage === mobContent.MobileLanguage);

        if (existingMobContent && existingMobContent.Image && existingMobContent.Image.Id) {
          const editModel: ImageEditRequest = {
            Id: existingMobContent && existingMobContent.Image ? existingMobContent.Image.Id : '',
            RuleContentId: existingMobContent ? existingMobContent.ImageId : ''
          };

          return this.campaignService.editImage(editModel, mobContent.File);
        }

        const addModel: ImageAddRequest = {
          RuleContentId: existingMobContent ? existingMobContent.ImageId : ''
        };

        return this.campaignService.addImage(addModel, mobContent.File);
      });

      forkJoin(requests).subscribe(
        () => {
          this.handleSuccess();
        },
        error => {
          console.error(error);

          this.snackBar.open(
            this.translateService.translates.ErrorImageUploadMessage,
            this.translateService.translates.CloseSnackbarBtnText
          );
        }
      );
    } else {
      this.handleSuccess();
    }
  }

  private handleSuccess() {
    this.snackBar.open('You have edited an earn action rule successfully ', 'Close', {
      duration: 5000
    });

    this.router.navigate(['/admin/platform/earn-action-rules'], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize
      }
    });
  }
}
