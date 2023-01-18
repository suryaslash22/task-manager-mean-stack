const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

//Load mongoose models

const { List, Task } = require('./db/models');
const { request } = require('express');
const { rulesToMonitor } = require('nodemon/lib/monitor/match');

//Load middleware
app.use(bodyParser.json());

/* ROUTE HANDLERS */

/* LIST ROUTES */

//GET /lists
//Purpose: Get all lists
app.get('/lists', (req, res) => {
    //Return array of all lists in DB
    List.find({}).then((lists) => {
        res.send(lists);
    });
});

//POST /lists
//Purpose: Create a list
app.post('/lists', (req, res) => {
    //Create new list, return new list to the user
    //List info passed via JSON body
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((ListDoc) => {
        //full list doc is returned
        res.send(ListDoc);
    });
});

//PATCH /lists
//Purpose: Update specified list
app.patch('/lists/:id', (req, res) => {
    //Update list with updated fields specified in the JSON body
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

//DELETE /lists
//Purpose: Delete list
app.delete('/lists/:id', (req, res) => {
    //Delete specified list
    List.findOneAndRemove({ _id: req.params.id }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
}); 

// //GET /lists/:listId/tasks/:taskId
// //Purpose: Get a specified task in a specified list
// app.get('/lists/:listId/tasks/:taskId', (req, res) => {
//     //Get a specific task from specified list
//     Task.findOne({
//         _listId: req.params.listId,
//         _id: req.params.taskId 
//     }).then((task) => {
//         res.send(task);
//     });
// });

//GET /lists/:listId/tasks
//Purpose: Get all tasks in a specified list
app.get('/lists/:listId/tasks', (req, res) => {
    //Get all tasks from specified list
    Task.find({ _listId: req.params.listId }).then((tasks) => {
        res.send(tasks);
    });
});

//POST /lists/:listId/tasks
//Purpose: Create new task in a specified list
app.post('/lists/:listId/tasks', (req, res) => {
    //Create new task in list specified by listId
   let newTask = new Task({ 
    title: req.body.title,
    _listId: req.params.listId
     });
   newTask.save().then((newTaskDoc) => {
    res.send(newTaskDoc);
   });
});

//PATCH /lists/:listId/tasks/taskId
//Purpose: Create new task in a specified list
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    //Update task in list specified by listId specified by taskId
    Task.findOneAndUpdate({ 
        _id: req.params.taskId,
        _listId: req.params.listId 
    }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

//DELETE /lists/listId/tasks/taskId
//Purpose: Delete task in list
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    //Delete specified task from list
    Task.findOneAndRemove({
        _id: req.params.taskId,
        _listId: req.params.listId 
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
}); 

// app.listen(3000, () => {
//     console.log("Server is listening on port 3000");
// })