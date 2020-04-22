import {Component, OnInit} from '@angular/core';
import {EmailVerificationRequest} from './interface/email-verification-request.interface';
import {ActivatedRoute} from '@angular/router';
import {PublicService} from '../public.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
})
export class EmailVerificationComponent implements OnInit {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorCode: string;
  verificationCode: string;

  constructor(private route: ActivatedRoute, private publicService: PublicService) {}

  ngOnInit() {
    this.verificationCode = this.route.snapshot.queryParams.code;

    if (!this.verificationCode) {
      this.isError = true;
      this.isLoading = false;
      return;
    }

    const model: EmailVerificationRequest = {
      VerificationCode: this.verificationCode,
    };

    this.isLoading = true;

    this.publicService.verifyEmail(model).subscribe(
      () => {
        this.isSuccess = true;
        this.isLoading = false;
      },
      ({error}) => {
        console.error(error);

        if (error && error.error) {
          this.errorCode = error.error;
        }

        this.isError = true;
        this.isLoading = false;
      }
    );
  }
}
