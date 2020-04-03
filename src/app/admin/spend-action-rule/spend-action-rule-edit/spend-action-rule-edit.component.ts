import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionRuleMobileContent} from '../../action-rule/models/action-rule-mobile-content.interface';
import {ImageEditRequest} from '../../action-rule/models/image-edit-request.interface';
import {forkJoin} from 'rxjs';
import {ImageAddRequest} from '../../action-rule/models/image-add-request.interface';
import {SpendActionRule} from '../models/spend-action-rule.interface';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {SpendActionRuleService} from '../spend-action-rule.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {DeepCopy} from 'src/app/shared/utils/common';
import {ROUTE_ADMIN_ROOT, ROUTE_SPEND_RULES} from 'src/app/core/constants/routes';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-spend-action-rule',
  templateUrl: './spend-action-rule-edit.component.html'
})
export class SpendActionRuleEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate') private subHeaderTemplate: TemplateRef<any>;
  ruleId: string;
  ruleForEdit: SpendActionRule;
  FormMode = FormMode;
  isLoading = true;
  isSaving = false;
  private rule: SpendActionRule;
  private previousPage = '';
  private previousPageSize = '';

  // translates
  @ViewChild('successMessageElement')
  successMessageElement: ElementRef;
  successMessage: string;

  constructor(
    private spendActionRuleService: SpendActionRuleService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit Spend Rule',
      subHeaderContent: this.subHeaderTemplate
    };

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.ruleId = this.route.snapshot.params.id;
    this.spendActionRuleService.getById(this.ruleId).subscribe(
      res => {
        this.rule = res;
        this.ruleForEdit = DeepCopy(res) as SpendActionRule;
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

  onFormSubmit(formData: SpendActionRule) {
    this.isSaving = true;

    const editModel = {...this.rule, ...formData};

    if (editModel.MobileContents !== this.rule.MobileContents) {
      const editedMobileContentsDictinary: any = editModel.MobileContents.reduce((obj: {[key: string]: ActionRuleMobileContent}, item) => {
        obj[item.MobileLanguage] = item;
        return obj;
      }, {});

      this.rule.MobileContents.forEach(mobContent => {
        const editedMobContent = editedMobileContentsDictinary[mobContent.MobileLanguage];

        if (editedMobContent) {
          mobContent.Title = editedMobContent.Title;
          mobContent.Description = editedMobContent.Description;
          mobContent.ImageBlobUrl = editedMobContent.ImageBlobUrl;
        }
      });
    }

    editModel.MobileContents = this.rule.MobileContents;

    this.spendActionRuleService.edit(editModel).subscribe(
      () => {
        this.saveImages(formData);
      },
      () => {
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private saveImages(formData: SpendActionRule) {
    const mobileContentsWithImages = formData.MobileContents.filter(mobContent => mobContent.File && mobContent.File.size > 0);

    if (mobileContentsWithImages.length) {
      const requests = mobileContentsWithImages.map(mobContent => {
        const existingMobContent = this.rule.MobileContents.find(val => val.MobileLanguage === mobContent.MobileLanguage);

        if (existingMobContent && existingMobContent.Image && existingMobContent.Image.Id) {
          const editModel: ImageEditRequest = {
            Id: existingMobContent && existingMobContent.Image ? existingMobContent.Image.Id : '',
            RuleContentId: existingMobContent ? existingMobContent.ImageId : ''
          };

          return this.spendActionRuleService.editImage(editModel, mobContent.File);
        }

        const addModel: ImageAddRequest = {
          RuleContentId: existingMobContent ? existingMobContent.ImageId : ''
        };

        return this.spendActionRuleService.addImage(addModel, mobContent.File);
      });

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
      this.spendActionRuleService.uploadVouchers(this.ruleId, formData.VouchersFile).subscribe(
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

          this.isSaving = false;
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
    this.router.navigate([`${ROUTE_ADMIN_ROOT}/${ROUTE_SPEND_RULES}`], {
      queryParams: {
        page: this.previousPage,
        pageSize: this.previousPageSize
      }
    });
  }
}
