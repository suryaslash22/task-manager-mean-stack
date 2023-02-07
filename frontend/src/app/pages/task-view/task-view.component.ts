import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { List } from 'src/app/models/list.model';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

lists: any;
tasks: any;
userEmail: string;
isUserAdmin: boolean;

selectedListId: string;

constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router, private authService: AuthService) { }

 ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        if(params['listId']){
         this.selectedListId = params['listId'];
              this.taskService.getTasks(params['listId']).subscribe((tasks: any) => {
                this.tasks = tasks;
                })
          }
          else{
            this.tasks = undefined;
          }
        }
      )
    this.taskService.getLists().subscribe((lists: any) => {
      this.lists = lists;
    })

    this.userEmail = this.authService.getUserEmail();
    this.isUserAdmin = this.authService.checkIfAdmin();
    // console.log(this.isUserAdmin);

  }
    
  onTaskClick(task: Task) {
    // we want to set the task to completed
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("Completed successully!");
      task.completed = !task.completed;
    })
  }

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }

  onDeleteTaskClick(id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
      this.tasks = this.tasks.filter(val => val._id !== id);
      console.log(res);
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
