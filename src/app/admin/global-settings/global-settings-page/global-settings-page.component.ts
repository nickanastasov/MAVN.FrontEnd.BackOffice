import {Component, OnInit, ElementRef, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {markFormControlAsTouched} from '../../../shared/utils/markFormControlAsTouched';
import {
  // validators
  AccuracyValidator,
  MoneyFormatValidator,
  MoneyMinMoreZeroValidator,
  MoneyMaxNumberValidator,
  MoneyMinZeroValidator
} from '../../../shared/utils/validators';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as constants from 'src/app/core/constants/const';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {GlobalTemplates} from 'src/app/shared/models/global-templates.interface';
import {GlobalSettingsService} from '../services/global-settings.service';
import {GlobalRate} from '../models/global-rate.interface';
import {AgentRequirements} from '../models/agent-requirements.interface';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {OperationFee} from '../models/operation-fees.interface';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-global-settings-page',
  templateUrl: './global-settings-page.component.html',
  styleUrls: ['./global-settings-page.component.scss']
})
export class GlobalSettingsPageComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  isLoadingRate = true;
  isLoadingAgentRequirements = true;
  isLoadingOperationFees = true;
  isSavingRate = false;
  isSavingAgentRequirements = false;
  isSavingOperationFees = false;
  baseCurrencyCode: string;
  tokenSymbol = constants.TOKEN_SYMBOL;
  CURRENCY_INPUT_ACCURACY = constants.CURRENCY_INPUT_ACCURACY;
  CURRENCY_INPUT_MAX_NUMBER = constants.CURRENCY_INPUT_MAX_NUMBER;
  CURRENCY_INPUT_MIN_NUMBER = constants.CURRENCY_INPUT_MIN_NUMBER;
  TOKENS_INPUT_ACCURACY = constants.TOKENS_INPUT_ACCURACY;
  TOKENS_INPUT_MAX_NUMBER = constants.TOKENS_INPUT_MAX_NUMBER;
  rateFormProps = {
    AmountInTokens: 'AmountInTokens',
    AmountInCurrency: 'AmountInCurrency'
  };
  agentRequirementsFormProps = {
    TokensAmount: 'TokensAmount'
  };
  operationRequirementsFormProps = {
    FirstTimeLinkingFee: 'FirstTimeLinkingFee',
    SubsequentLinkingFee: 'SubsequentLinkingFee',
    CrossChainTransferFee: 'CrossChainTransferFee'
  };

  rateForm = this.fb.group({
    [this.rateFormProps.AmountInTokens]: [
      1,
      [
        // validators
        Validators.required,
        MoneyFormatValidator(),
        MoneyMinMoreZeroValidator(),
        MoneyMaxNumberValidator(),
        AccuracyValidator(constants.TOKENS_INPUT_ACCURACY)
      ]
    ],
    [this.rateFormProps.AmountInCurrency]: [
      1,
      [
        // Validators
        Validators.required,
        Validators.min(constants.CURRENCY_INPUT_MIN_NUMBER),
        Validators.max(constants.CURRENCY_INPUT_MAX_NUMBER),
        AccuracyValidator(constants.CURRENCY_INPUT_ACCURACY)
      ]
    ]
  });

  agentRequirementsForm = this.fb.group({
    [this.agentRequirementsFormProps.TokensAmount]: [
      1,
      [
        // validators
        Validators.required,
        MoneyFormatValidator(),
        MoneyMinZeroValidator(),
        MoneyMaxNumberValidator(),
        AccuracyValidator(constants.TOKENS_INPUT_ACCURACY)
      ]
    ]
  });
  isVisibleAgentRequirements = true;

  defaultMoneyValidator = [
    1,
    [
      // validators
      Validators.required,
      MoneyFormatValidator(),
      MoneyMinZeroValidator(),
      MoneyMaxNumberValidator(),
      AccuracyValidator(constants.TOKENS_INPUT_ACCURACY)
    ]
  ];

  operationFeesForm = this.fb.group({
    [this.operationRequirementsFormProps.FirstTimeLinkingFee]: this.defaultMoneyValidator,
    [this.operationRequirementsFormProps.SubsequentLinkingFee]: this.defaultMoneyValidator,
    [this.operationRequirementsFormProps.CrossChainTransferFee]: this.defaultMoneyValidator
  });
  isVisibleOperationFees = true;

  // #region translates
  @ViewChild('savedSuccessfullyMessage', {static: true})
  savedSuccessfullyMessage: ElementRef<HTMLElement>;
  private translates = {
    savedSuccessfullyMessage: ''
  };

  templates: GlobalTemplates;
  // #endregion
  hasEditPermission = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private globalSettingsService: GlobalSettingsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private headerMenuService: HeaderMenuService
  ) {
    this.templates = this.translateService.templates;
    this.baseCurrencyCode = this.settingsService.baseCurrencyCode;
    this.hasEditPermission = this.authenticationService.getUserPermissions()[PermissionType.Settings].Edit;
  }

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Settings',
      subHeaderContent: this.subHeaderTemplate
    };

    // translates
    this.translates.savedSuccessfullyMessage = this.savedSuccessfullyMessage.nativeElement.innerText;

    this.loadRate();

    this.isVisibleAgentRequirements = !this.settingsService.IsPublicBlockchainFeatureDisabled;
    if (!this.settingsService.IsPublicBlockchainFeatureDisabled) {
      this.loadAgentRequirements();
    }

    this.isVisibleOperationFees = !this.settingsService.IsRealEstateFeatureDisabled;
    if (!this.settingsService.IsRealEstateFeatureDisabled) {
      this.loadOperationFees();
    }

    if (!this.hasEditPermission) {
      this.rateForm.disable();
      this.agentRequirementsForm.disable();
      this.operationFeesForm.disable();
    }
  }

  private saveRate(): void {
    markFormControlAsTouched(this.rateForm);

    if (this.rateForm.invalid) {
      return;
    }

    this.isSavingRate = true;
    const model = this.rateForm.value as GlobalRate;

    this.globalSettingsService.updateGlobalRate(model).subscribe(
      () => {
        this.snackBar.open(this.translates.savedSuccessfullyMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
        this.isSavingRate = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isSavingRate = false;
      }
    );
  }

  private loadRate(): void {
    this.globalSettingsService.getGlobalRate().subscribe(
      response => {
        const tokensControl = this.rateForm.get(this.rateFormProps.AmountInTokens);
        const currencyControl = this.rateForm.get(this.rateFormProps.AmountInCurrency);

        tokensControl.setValue(response.AmountInTokens);
        currencyControl.setValue(response.AmountInCurrency);
        this.isLoadingRate = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private saveAgentRequirements(): void {
    markFormControlAsTouched(this.agentRequirementsForm);

    if (this.agentRequirementsForm.invalid) {
      return;
    }

    this.isSavingAgentRequirements = true;
    const model = this.agentRequirementsForm.value as AgentRequirements;

    this.globalSettingsService.updateAgentRequirements(model).subscribe(
      () => {
        this.snackBar.open(this.translates.savedSuccessfullyMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
        this.isSavingAgentRequirements = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isSavingAgentRequirements = false;
      }
    );
  }

  private saveOperationFees(): void {
    markFormControlAsTouched(this.operationFeesForm);

    if (this.operationFeesForm.invalid) {
      return;
    }

    this.isSavingOperationFees = true;
    const model = {} as OperationFee;

    if (this.operationFeesForm.get(this.operationRequirementsFormProps.CrossChainTransferFee).dirty) {
      model.CrossChainTransferFee = this.operationFeesForm.value.CrossChainTransferFee.toString();
    }
    if (this.operationFeesForm.get(this.operationRequirementsFormProps.FirstTimeLinkingFee).dirty) {
      model.FirstTimeLinkingFee = this.operationFeesForm.value.FirstTimeLinkingFee.toString();
    }
    if (this.operationFeesForm.get(this.operationRequirementsFormProps.SubsequentLinkingFee).dirty) {
      model.SubsequentLinkingFee = this.operationFeesForm.value.SubsequentLinkingFee.toString();
    }

    this.globalSettingsService.updateOperationFees(model).subscribe(
      () => {
        this.snackBar.open(this.translates.savedSuccessfullyMessage, this.translateService.translates.CloseSnackbarBtnText, {
          duration: 5000
        });
        this.isSavingOperationFees = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
        this.isSavingOperationFees = false;
      }
    );
  }

  private loadAgentRequirements(): void {
    this.globalSettingsService.getAgentRequirements().subscribe(
      response => {
        const tokensControl = this.agentRequirementsForm.get(this.agentRequirementsFormProps.TokensAmount);

        tokensControl.setValue(response.TokensAmount);
        this.isLoadingAgentRequirements = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  private loadOperationFees(): void {
    this.globalSettingsService.getOperationFees().subscribe(
      response => {
        const crossChainTransferControl = this.operationFeesForm.get(this.operationRequirementsFormProps.CrossChainTransferFee);
        crossChainTransferControl.setValue(response.CrossChainTransferFee);

        const firstTimeLinkingFeeControl = this.operationFeesForm.get(this.operationRequirementsFormProps.FirstTimeLinkingFee);
        firstTimeLinkingFeeControl.setValue(response.FirstTimeLinkingFee);

        const subsequentLinkingFeeControl = this.operationFeesForm.get(this.operationRequirementsFormProps.SubsequentLinkingFee);
        subsequentLinkingFeeControl.setValue(response.SubsequentLinkingFee);

        this.isLoadingOperationFees = false;
      },
      error => {
        console.error(error);
        this.snackBar.open(this.translateService.translates.ErrorMessage, this.translateService.translates.CloseSnackbarBtnText);
      }
    );
  }

  save(): void {
    if (!this.hasEditPermission) {
      return;
    }

    if (this.rateForm.dirty) {
      this.saveRate();
    }

    if (this.agentRequirementsForm.dirty) {
      this.saveAgentRequirements();
    }

    if (this.operationFeesForm.dirty) {
      this.saveOperationFees();
    }
  }
}
