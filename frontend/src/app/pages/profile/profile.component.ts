import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(){}

  OnChangePwButtonClicked(oldPw: string, newPw: string, confirmNewPw: string){
    // all fields must have an entry
    if (!oldPw || !newPw || !confirmNewPw){
      Swal.fire({
        title: 'Error',
        html: 'Please fill in all fields!',
        icon: 'error',
        backdrop: false
      })
    }

    // password does not fit criteria
    else if (newPw.length < 8){
      Swal.fire({
        title: 'Error',
        html: 'New password must be at least 8 characters long',
        icon: 'error',
        backdrop: false
      })
    }

    // passwords not matching
    else if (newPw !== confirmNewPw){
      Swal.fire({
        title: 'Error',
        text: "Passwords don't match",
        icon: 'error',
        backdrop: false
      })
    }

    // pw same as old
    else if (newPw === oldPw){
      Swal.fire({
        title: 'Error',
        text: 'New password must not be the same as old password',
        icon: 'error',
        backdrop: false
      })
    }
    
    // check if old pw is correct
    // perform login to check if pw is correct, if status 200 then ok
    else{
      let email = this.authService.getUserEmail();
      this.authService.login(email, oldPw).subscribe((res: HttpResponse<any>) => {
        if (res.status === 200) {
          // perform pw change
          console.log("allow pw change");
          this.authService.changePw(email, newPw).subscribe((res2: HttpResponse<any>) => {
            // pw is changed but receiving an error here
            // Unexpected token 'O', \"OK\" is not valid JSON

            // if (res.status === 200) {
              // pw changed
              // console.log(res);
            // }
          })
          Swal.fire({
            title: 'Success',
            text: 'Your password has been changed successfully!',
            icon: 'success',
            backdrop: false
          }).then(() => {
            this.router.navigate(['/']);
          })
          
        }
      })
    }
    
  }
}