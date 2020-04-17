import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {Partner} from '../models/partner.interface';
import {FormMode} from 'src/app/shared/models/form-mode.interface';
import {PartnersService} from '../partners.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, ActivatedRoute} from '@angular/router';
import {HeaderMenuService} from 'src/app/shared/services/header-menu.service';

@Component({
  selector: 'app-partner-edit',
  templateUrl: './partner-edit.component.html',
  styleUrls: ['./partner-edit.component.scss']
})
export class PartnerEditComponent implements OnInit {
  @ViewChild('subHeaderTemplate', {static: true}) private subHeaderTemplate: TemplateRef<any>;
  partnerId: string;
  partner: Partner;
  FormMode = FormMode;
  isFormDisabled = false;
  loading = true;
  private previousPage = '';
  private previousPageSize = '';

  constructor(
    private partnersService: PartnersService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private headerMenuService: HeaderMenuService
  ) {}

  ngOnInit() {
    this.headerMenuService.headerMenuContent = {
      title: 'Edit Partner',
      subHeaderContent: this.subHeaderTemplate
    };

    this.previousPage = window.history.state.page;
    this.previousPageSize = window.history.state.pageSize;
    this.partnerId = this.route.snapshot.params.id;
    this.partnersService.getById(this.partnerId).subscribe(
      partner => {
        this.partner = partner;
        this.loading = false;
      },
      () => {
        this.router.navigate(['/admin/platform/partners']);

        this.snackBar.open('Something went wrong. Please try again', 'Close', {
          duration: 5000
        });
      }
    );
  }

  onFormSubmit(partner: Partner) {
    this.isFormDisabled = true;
    this.loading = true;

    this.partnersService.update({...this.partner, ...partner}).subscribe(
      () => {
        this.snackBar.open('You have edited partner successfully ', 'Close', {
          duration: 5000
        });

        this.router.navigate(['/admin/platform/partners'], {
          queryParams: {
            page: this.previousPage,
            pageSize: this.previousPageSize
          }
        });
      },
      () => {
        this.loading = false;
        this.isFormDisabled = false;
        this.snackBar.open('Something went wrong. Please try again', 'Close', {
          duration: 5000
        });
      }
    );
  }
}
