import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }

  // isUserAdmin : boolean;

  login( email: string, password: string) {
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will be in the header of this response
        this.setSession(email, res.body._id, res.headers.get('x-access-token') as string, res.headers.get('x-refresh-token') as string, res.body.isAdmin);
        console.log("Logged in");
      }
    )
    )
  }
  signup( email: string, password: string) {
    return this.webService.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will be in the header of this response
        this.setSession(email, res.body._id, res.headers.get('x-access-token') as string, res.headers.get('x-refresh-token') as string, res.body.isAdmin);
        console.log("Signed up");
      }
    )
    )
  }

  changePw(email: string, password: string){
    let userId = this.getUserId();
    return this.webService.changePw(email, password, userId).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        console.log("Password changed successfully");
      })
    )
  }

  logout(){ 
    this.removeSession();
    this.router.navigate(['/login']);
  }

  token: any;
  isLoggedIn(): boolean {
    if (this.getAccessToken()) return true;
    else return false;
  }

  getAccessToken(){
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken(){
    return localStorage.getItem('x-refresh-token') as string;
  }

  getUserId(){
    return localStorage.getItem('user-id') as string;
  }

  getUserEmail(){
    return localStorage.getItem('user-email');
  }

  setAccessToken(accessToken: string){
    localStorage.setItem('x-access-token', accessToken);
  }

  private setSession(userEmail : string, userId: string, accessToken: string, refreshToken: string, isAdmin: boolean){
    localStorage.setItem('user-email', userEmail);
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
    localStorage.setItem('has-admin-privileges', String(isAdmin));
  }

  private removeSession(){
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
    localStorage.removeItem('has-admin-privileges');
  }

  getNewAccessToken() {
    return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        this.setAccessToken(res.headers.get('x-access-token')!);
      })
    )
  }

  checkIfAdmin(){ return localStorage.getItem('has-admin-privileges') === 'true'; }

}
