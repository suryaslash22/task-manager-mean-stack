import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss']
})
export class ChangeEmailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }

  userId: string;

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.userId = params.userId;
        console.log(params.userId);
      }
    )
  }

  changeUserEmail(title: string) {
    this.userService.changeUserEmail(this.userId, title).subscribe((res: any) => {
      this.router.navigate(['/admin']);
      console.log("Email changed successfully");
    })
  }

}
