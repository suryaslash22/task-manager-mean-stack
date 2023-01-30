import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private route1: Router){ }

  listId: string= '';
  
  ngOnInit(){
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId'];
        console.log(this.listId)
      })
    }
  
  createTask(title: string){
    this.taskService.createTask(title, this.listId).subscribe((newTask: any) => {
      console.log(newTask);
      this.route1.navigate(['../'], {relativeTo: this.route});
    });
  }
}

