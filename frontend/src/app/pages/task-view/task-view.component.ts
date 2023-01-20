import { Component } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
constructor(private taskService: TaskService) { }

ngOnInit() {
}

createNewList(){
  this.taskService.createList('testing').subscribe((response: any) => {
    console.log(response);
  });
}}
