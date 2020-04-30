import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';

@Component({
  selector: 'app-intro-page',
  templateUrl: './intro-page.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class IntroPageComponent implements OnInit {
  isLoading = true;
  private hasPermission = false;

  constructor(
    // services
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    const isPartnerAdmin = this.authenticationService.isPartnerAdmin();
    this.hasPermission = this.authenticationService.getUserPermissions()[PermissionType.Dashboard].View || isPartnerAdmin;
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.router.navigate(['admin/platform/dashboard']);
    } else {
      this.isLoading = false;
    }
  }
}
