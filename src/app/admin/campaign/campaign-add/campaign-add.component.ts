import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {Campaign} from '../models/campaign.interface';
import {CampaignService} from '../campaign.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ImageAddRequest} from '../../action-rule/models/image-add-request.interface';
import {ImageContentCreatedResponse} from '../../action-rule/models/image-content-created-response.interface';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-campaign-add',
  templateUrl: './campaign-add.component.html',
  styleUrls: ['./campaign-add.component.scss']
})
export class CampaignAddComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  isSaving = false;

  constructor(
    // services
    private campaignService: CampaignService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'New Earn Campaign',
      subHeaderContent: this.subHeaderTemplate
    };
  }

  onFormSubmit(formData: Campaign) {
    this.isSaving = true;

    this.campaignService.create(formData).subscribe(
      response => {
        this.saveImages(formData, response.CreatedImageContents);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private saveImages(formData: Campaign, createdImageContents: ImageContentCreatedResponse[]) {
    const mobileContentsWithImages = formData.MobileContents.filter(mobContent => mobContent.File && mobContent.File.size > 0);

    const requests = mobileContentsWithImages.map(mobContent => {
      const createdImageContent = createdImageContents.find(val => val.MobileLanguage === mobContent.MobileLanguage);

      const model: ImageAddRequest = {
        RuleContentId: createdImageContent ? createdImageContent.RuleContentId : ''
      };

      return this.campaignService.addImage(model, mobContent.File);
    });

    if (requests.length) {
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
    this.snackBar.open('You have created an earn action rule successfully', 'Close', {
      duration: 5000
    });

    this.router.navigate(['/admin/platform/earn-action-rules']);
  }
}
