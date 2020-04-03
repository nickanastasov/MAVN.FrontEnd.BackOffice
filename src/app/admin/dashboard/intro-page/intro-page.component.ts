import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {PermissionType} from '../../user/models/permission-type.enum';

@Component({
  selector: 'app-intro-page',
  templateUrl: './intro-page.component.html',
  encapsulation: ViewEncapsulation.None
})
export class IntroPageComponent implements OnInit {
  isLoading = true;
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  ngOnInit() {
    const permissions = this.authenticationService.getUserPermissions();

    if (permissions[PermissionType.Dashboard] && permissions[PermissionType.Dashboard].View) {
      this.router.navigate(['admin/platform/dashboard']);
    } else {
      this.isLoading = false;
    }
  }
}
