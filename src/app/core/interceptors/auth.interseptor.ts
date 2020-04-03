import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpEvent} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from 'src/app/authentication/authentication.service';
import {ROUTE_FOR_AUTHENTICATION} from '../constants/routes';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.authenticationService.clearToken();
          window.location.href = this.authenticationService.getLoginPathWithReturnUrl();
        } else if (err.status === 403) {
          console.error('403', request);
          this.authenticationService.logout();
          window.location.href = ROUTE_FOR_AUTHENTICATION;
        }

        return throwError(err);
      })
    );
  }
}
