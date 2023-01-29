import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';



@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

lists: any;
tasks: any;


constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
      console.log(params);
         this.taskService.getTasks(params['listId']).subscribe((tasks: any) => {
          console.log(tasks);
         this.tasks = tasks;
                    })
                }
      )
    this.taskService.getLists().subscribe((lists: any) => {
      this.lists = lists;
    })
    }
  }
