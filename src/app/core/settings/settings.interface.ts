import {PasswordValidationRules} from 'src/app/shared/models/password-validation.interface';

export interface Settings {
  BackofficePlatform: {
    AdminApiGatewayUrl: string;
    HelpDocumentUrl: string;
    HideBlockchainMenu: boolean;
    HideTransactionsMenu: boolean;
    HideSegmentMenu: boolean;
    HideTierMenu: boolean;
    BaseCurrencyCode: string;
    PasswordValidationSettings: PasswordValidationRules;
    MobileAppImageFileSizeInKB: number;
    MobileAppImageMinWidth: number;
    MobileAppImageMinHeight: number;
    IsRealEstateFeatureDisabled: boolean;
    IsPublicBlockchainFeatureDisabled: boolean;
  };
}
