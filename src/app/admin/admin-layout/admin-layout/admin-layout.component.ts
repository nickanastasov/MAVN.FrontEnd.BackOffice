import {Component, OnInit, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {TranslateService} from 'src/app/shared/services/translate.service';
import {SettingsService} from 'src/app/core/settings/settings.service';
import {BusinessVerticalService} from '../../partners/services/business-vertical.service';
import {BusinessVerticalType} from '../../partners/models/business-vertical.enum';
import {User} from '../../user/models/user.interface';
import {StatisticsService} from 'src/app/shared/services/statistics.service';
import {PermissionType} from '../../user/models/permission-type.enum';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';

declare var KTApp: any;
declare var KTLayout: any;

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  //#region Permissions

  showDashboard = false;
  showCustomers = false;
  showActionRules = false;
  showBlockchainOperations = false;
  showReports = false;
  showProgramPartners = false;
  showSettings = false;
  showAdminUsers = false;
  // not used for now
  showSegmentMenu = false;
  // not used for now
  showTierMenu = false;

  //#endregion

  user: User;
  userInitials: string;
  tokenSymbol = TOKEN_SYMBOL;
  totalTokenSupply: string | number;
  isLoading = true;

  //#region global translates
  @ViewChild('closeSnackbarBtnTextElement')
  closeSnackbarBtnTextElement: ElementRef;

  @ViewChild('errorMessageElement')
  errorMessageElement: ElementRef;

  @ViewChild('errorImageUploadMessageElement')
  errorImageUploadMessageElement: ElementRef;
  //#endregion

  //#region global templates
  @ViewChild('lengthError')
  lengthError: TemplateRef<any>;
  @ViewChild('moneyFormatError')
  moneyFormatError: TemplateRef<any>;
  @ViewChild('minNumberError')
  minNumberError: TemplateRef<any>;
  @ViewChild('minMoreZeroNumberError')
  minMoreZeroNumberError: TemplateRef<any>;
  @ViewChild('maxNumberError')
  maxNumberError: TemplateRef<any>;
  @ViewChild('invalidAccuracyError')
  invalidAccuracyError: TemplateRef<any>;
  @ViewChild('intRangeError')
  intRangeError: TemplateRef<any>;
  //#endregion

  //#region Translates for Business Vertical
  @ViewChild('BusinessVerticalTypeHospitality')
  BusinessVerticalTypeHospitality: ElementRef<HTMLElement>;
  @ViewChild('BusinessVerticalTypeRealEstate')
  BusinessVerticalTypeRealEstate: ElementRef<HTMLElement>;
  @ViewChild('BusinessVerticalTypeRetail')
  BusinessVerticalTypeRetail: ElementRef<HTMLElement>;
  //#endregion

  constructor(
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    private businessVerticalService: BusinessVerticalService,
    private translateService: TranslateService,
    private statisticService: StatisticsService
  ) {}

  ngOnInit() {
    this.user = this.authenticationService.getUserData();
    this.userInitials = (this.user.FirstName ? this.user.FirstName[0] : '') + (this.user.LastName ? this.user.LastName[0] : '');

    //#region permissions

    const permissions = this.authenticationService.getUserPermissions();

    for (const key in permissions) {
      if (permissions.hasOwnProperty(key)) {
        const permission = permissions[key];

        switch (key) {
          case PermissionType.Dashboard:
            if (permission.View) {
              this.showDashboard = true;
            }
            break;
          case PermissionType.Customers:
            if (permission.View) {
              this.showCustomers = true;
            }
            break;
          case PermissionType.ActionRules:
            if (permission.View) {
              this.showActionRules = true;
            }
            break;
          case PermissionType.BlockchainOperations:
            if (permission.View) {
              this.showBlockchainOperations = true;
            }
            break;
          case PermissionType.Reports:
            if (permission.View) {
              this.showReports = true;
            }
            break;
          case PermissionType.ProgramPartners:
            if (permission.View) {
              this.showProgramPartners = true;
            }
            break;
          case PermissionType.Settings:
            if (permission.View) {
              this.showSettings = true;
            }
            break;
          case PermissionType.AdminUsers:
            if (permission.View) {
              this.showAdminUsers = true;
            }
            break;
          default:
            break;
        }
      }
    }

    this.showBlockchainOperations = !this.settingsService.hideBlockchainMenu && this.showBlockchainOperations;
    this.showReports = !this.settingsService.hideTransactionsMenu && this.showReports;

    // not used now
    // this.showSegmentMenu = !this.settingsService.hideSegmentMenu;
    // this.showTierMenu = !this.settingsService.hideTierMenu;

    //#endregion

    this.statisticService.getTotalVoucherCampaignsSupply().subscribe(response => {
      this.totalTokenSupply = response.ActiveCampaignsVouchersTotalCount;
      this.isLoading = false;
    });

    const KTAppOptions = {
      colors: {
        state: {
          brand: '#4e3a96',
          metal: '#c4c5d6',
          light: '#ffffff',
          accent: '#00c5dc',
          primary: '#5867dd',
          success: '#1dc9b7',
          info: '#36a3f7',
          warning: '#ffb822',
          danger: '#fd3995',
          focus: '#9816f4'
        },
        base: {
          label: ['#c5cbe3', '#a1a8c3', '#3d4465', '#3e4466'],
          shape: ['#f0f3ff', '#d9dffa', '#afb4d4', '#646c9a']
        }
      }
    };

    (KTLayout as any).init();
    (KTApp as any).init(KTAppOptions);

    //#region global translates
    const translates = this.translateService.translates;
    translates.CloseSnackbarBtnText = (this.closeSnackbarBtnTextElement.nativeElement as HTMLElement).innerText;
    translates.ErrorMessage = (this.errorMessageElement.nativeElement as HTMLElement).innerText;
    translates.ErrorImageUploadMessage = (this.errorImageUploadMessageElement.nativeElement as HTMLElement).innerText;
    //#endregion

    //#region global templates
    const templates = this.translateService.templates;
    templates.lengthError = this.lengthError;
    templates.intRangeError = this.intRangeError;
    templates.moneyFormatError = this.moneyFormatError;
    templates.minNumberError = this.minNumberError;
    templates.minMoreZeroNumberError = this.minMoreZeroNumberError;
    templates.maxNumberError = this.maxNumberError;
    templates.invalidAccuracyError = this.invalidAccuracyError;
    //#endregion

    // business vertical
    const businessVerticalItems = this.businessVerticalService.getBusinessVerticalItems();

    businessVerticalItems.forEach(x => {
      switch (x.Type) {
        case BusinessVerticalType.Hospitality:
          x.DisplayName = this.BusinessVerticalTypeHospitality.nativeElement.innerText;
          break;
        case BusinessVerticalType.RealEstate:
          x.DisplayName = this.BusinessVerticalTypeRealEstate.nativeElement.innerText;
          break;
        case BusinessVerticalType.Retail:
          x.DisplayName = this.BusinessVerticalTypeRetail.nativeElement.innerText;
          break;
        default:
          console.error('BusinessVerticalType out of range');
          break;
      }
    });
  }

  logout() {
    this.authenticationService.logout();
    window.location.href = this.authenticationService.getLoginPathWithReturnUrl();
  }

  goToHelp() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/open#noreferrer
    // this feature also automatically sets noopener
    window.open(this.settingsService.helpDocumentUrl, '_blank', 'noreferrer');
  }
}
