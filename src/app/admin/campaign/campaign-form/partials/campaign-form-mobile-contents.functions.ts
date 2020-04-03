import {MobileLanguage} from 'src/app/shared/models/mobile-language.enum';
import {ValidatorFn, Validators, AbstractControl} from '@angular/forms';
import {LengthValidator, FileSizeValidator, FileExtensionValidator, FileDimensionsValidator} from 'src/app/shared/utils/validators';
import {CampaignFormType} from '../campaign-form-type.enum';
import {markFormControlAsTouched} from 'src/app/shared/utils/markFormControlAsTouched';
import {CampaignFormComponent} from '../campaign-form.component';
import * as actionRulesConstants from '../../../action-rule/constants/const';

export function onNameBlur(this: CampaignFormComponent) {
  if (this.isEnglish && !this.isTitleCopied && this.type === CampaignFormType.CREATE) {
    const titleControl = this.campaignForm.get(this.campaignFormProps.Name);

    if (titleControl.value && titleControl.valid) {
      const mobileContentTitleControl = this.mobileContentsFormArray.controls.find(
        control => control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En
      );

      if (mobileContentTitleControl) {
        mobileContentTitleControl.get(this.mobileContentFormProps.Title).setValue(titleControl.value);
        this.isTitleCopied = true;
      }
    }
  }
}

export function onDescriptionBlur(this: CampaignFormComponent) {
  if (this.isEnglish && !this.isDescriptionCopied && this.type === CampaignFormType.CREATE) {
    const descriptionControl = this.campaignForm.get(this.mobileContentFormProps.Description);

    if (descriptionControl.value && descriptionControl.valid) {
      const mobileContentTitleControl = this.mobileContentsFormArray.controls.find(
        control => control.get(this.mobileContentFormProps.MobileLanguage).value === MobileLanguage.En
      );

      if (mobileContentTitleControl) {
        mobileContentTitleControl.get(this.mobileContentFormProps.Description).setValue(descriptionControl.value);
        this.isDescriptionCopied = true;
      }
    }
  }
}

export function addFiles(this: CampaignFormComponent, files: FileList, index: number): void {
  if (!files || files.length === 0) {
    return;
  }

  const fileControl = this.mobileContentsFormArray.at(index).get(this.mobileContentFormProps.File);

  markFormControlAsTouched(fileControl);
  fileControl.setValue(files[0]);
  fileControl.updateValueAndValidity();

  // This is a workaround with an issue that the Angular team has not fixed yet.
  // The issue is that when you have AsyncValidator, you don't receive properly whether the field is valid or not.
  // The main idea here is to run this function on the next event lifecycle.
  // It works with value of "1", but just to be sure, I put "200". It does not interfere with the performance and the user flow.
  setTimeout(() => {
    this.updateContentPreviewImageUrl(fileControl);
  }, 200);
}

export function selectedTabIndexChange(this: CampaignFormComponent, index: number) {
  this.updateContentPreviewBindings(index);
}

export function getAcceptFilesExtensions(): string {
  return actionRulesConstants.MOBILE_APP_IMAGE_ACCEPTED_FILE_EXTENSION;
}

// protected
export function generateMobileContentFormGroup(this: CampaignFormComponent, language: MobileLanguage | string, hasImage: boolean = null) {
  const titleValidators: ValidatorFn[] = [];
  const descriptionValidators: ValidatorFn[] = [];
  const fileValidators: ValidatorFn[] = [];

  if (language === MobileLanguage.En) {
    titleValidators.push(Validators.required);
    descriptionValidators.push(Validators.required);

    if (!hasImage) {
      // fileValidators.push(Validators.required);
    }
  }

  titleValidators.push(LengthValidator(3, 50));
  descriptionValidators.push(LengthValidator(3, 1000));
  fileValidators.push(
    ...[FileExtensionValidator(this.getAcceptFilesExtensions()), FileSizeValidator(this.settingsService.MobileAppImageFileSizeInKB)]
  );

  return this.fb.group({
    [this.mobileContentFormProps.MobileLanguage]: [language],
    [this.mobileContentFormProps.Title]: [null, titleValidators],
    [this.mobileContentFormProps.Description]: [null, descriptionValidators],
    [this.mobileContentFormProps.File]: [
      null,
      fileValidators,
      [FileDimensionsValidator(this.MobileAppImageMinWidth, this.MobileAppImageMinHeight)]
    ],
    [this.mobileContentFormProps.ImageBlobUrl]: [null]
  });
}

export function updateContentPreviewBindings(this: CampaignFormComponent, selectedTabIndex: number) {
  const currentTabFormGroup = this.mobileContentsFormArray.at(selectedTabIndex);

  const mobileLanguage = currentTabFormGroup.get(this.mobileContentFormProps.MobileLanguage).value;
  const titleControl = currentTabFormGroup.get(this.mobileContentFormProps.Title);
  const descriptionControl = currentTabFormGroup.get(this.mobileContentFormProps.Description);
  const fileControl = currentTabFormGroup.get(this.mobileContentFormProps.File);

  if (fileControl && fileControl.value && fileControl.valid) {
    this.updateContentPreviewImageUrl(fileControl);
  } else if (this.imageUrlsDictionary[mobileLanguage]) {
    this.contentPreviewImageUrl = this.imageUrlsDictionary[mobileLanguage];
  } else {
    this.contentPreviewImageUrl = null;
  }

  this.contentPreviewTitle = titleControl.value;
  this.contentPreviewDescription = descriptionControl.value;

  if (this.subscriptionsContentPreview.length) {
    this.subscriptionsContentPreview.forEach(subscription => subscription.unsubscribe());
  }

  this.subscriptionsContentPreview = [
    titleControl.valueChanges.subscribe(value => {
      this.contentPreviewTitle = value;
    }),
    descriptionControl.valueChanges.subscribe(value => {
      this.contentPreviewDescription = value;
    })
  ];
}

export function updateContentPreviewImageUrl(this: CampaignFormComponent, fileControl: AbstractControl) {
  if (fileControl.value && fileControl.valid) {
    const reader = new FileReader();
    reader.onload = () => (this.contentPreviewImageUrl = reader.result as string);
    reader.readAsDataURL(fileControl.value);
  } else {
    this.contentPreviewImageUrl = null;
  }
}
