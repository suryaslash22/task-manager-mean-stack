import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean | undefined;
  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle the request

    request = this.addAuthHeader(request);

    // call next() and handle response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        const login_url = "http://localhost:3000/users/login";
        const users_url = "http://localhost:3000/users";

        if (error.status === 401){
          // 401 so we are unauthorized

          // refresh access token
          return this.refreshAccessToken()
          .pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log(err);
              this.authService.logout();
              return empty();
            })
          )
        }

        else if (error.url === login_url){
            Swal.fire({
              title: 'Error',
              text: 'Please check your credentials',
              icon: 'error',
              backdrop: false
          })
        }

        else if (error.url === users_url && error.status === 400){
          if (error.error.code && error.error.code === 11000){
            Swal.fire({
              title: 'Error',
              html: 'Email already registered. Please log in.',
              icon: 'error',
              backdrop: false
          })
          }
          else{
            Swal.fire({
              title: 'Error',
              html: '1. Email must be at least 1 character long. <br>2. Password must be at least 8 characters long.',
              icon: 'error',
              backdrop: false
          })
        }
        }

        return throwError(error);
      })
    )
  }

 refreshAccessToken(){
    this.refreshingAccessToken = true;
    // we want to call a method to send a request to refresh access token
    return this.authService.getNewAccessToken().pipe(
      tap(() => {
        this.refreshingAccessToken = false;
        console.log("Access Token Refreshed!");
      })
    )
  }

  addAuthHeader(request: HttpRequest<any>){
    // get access token
    const token = this.authService.getAccessToken();

    if (token) {
          // append access token to req header
          return request.clone({
            setHeaders: {
              'x-access-token': token
            }
          })
    }
    return request;

  }
}
