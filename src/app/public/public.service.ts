import {Injectable} from '@angular/core';
import {EmailVerificationRequest} from './email-verification/interface/email-verification-request.interface';
import {ApiHttpService} from 'ngx-api-utils';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  constructor(private apiHttp: ApiHttpService) {}

  verifyEmail(model: EmailVerificationRequest) {
    return this.apiHttp.post('/api/Emails/verify-email', model, {headers: this.apiHttp.headersWithNoAuthorization()});
  }
}
