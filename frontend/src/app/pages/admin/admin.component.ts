import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/user.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit{

  users: any;
  page_num: number = 1;
  items_per_page: number = 6;

  constructor(private authService: AuthService, private userService: UserService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    })
  }

  onUserEmailChangeClick(userId: string) {
    // perform email change
    // console.log("email change button clicked");
    this.router.navigate(['admin/users/', userId, 'change-email']);
  }

  onUserPwChangeClick(userId: string) {
    // perform pw change
    console.log("pw change button clicked");
  }

  onUserMakeAdminClick(id: string) {
    // perform make admin
    // console.log("make admin button clicked");
    this.userService.makeUserAdmin(id).subscribe((res: any) => {
      console.log(res);
      console.log(id + " has been granted admin privileges");
    });
  }

  onUserDeleteClick(id: string) {
    // perform user delete
    console.log("user delete button clicked");
    this.userService.deleteUser(id).subscribe((res: any) => {
      console.log(res);
      console.log(id + " has been deleted");
      location.reload();
    })
  }

  logout(){
    this.authService.logout();
    console.log("Logged out");
  }

  logoutButton(){
    Swal.fire({
      text: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      backdrop: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.logout();
      }})   
  }

}
