import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {
  
  /*constructor(private authService: AuthService){}
  ngOnInit(){

  }
  onSignupButtonClicked(email: string, password: string){
    this.authService.signup(email, password).subscribe((res: HttpResponse<any>)=>{
      console.log(res);
    });
  }
Needs additional settings in the auth.service.ts file. Look on part 13 on minute 4.03 */


}