const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');
const { List, Task , User } = require('./db/models');
const jwt = require('jsonwebtoken');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
var cors = require('cors');
app.use(cors())

const options = {
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: "TaskManager in swagger",
      version: "1.0.0",
    },
      components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
           in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["app.js"],
};

const swaggerSpecs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/* MIDDLEWARE  */

// Load middleware
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');
    
    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// check whether the request has a valid admin JWT access token
let authenticateAdmin = (req, res, next) => {
    let token = req.header('x-access-token');
    
    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            User.findById(req.user_id).then((user) => {
                if (!user.checkIfAdmin()){
                    // return Promise.reject({
                        // 'error' : 'User does not have admin privileges!!'
                    // });
                    // there was an error
                    // jwt is invalid - * DO NOT AUTHENTICATE *
                    res.status(401).send("User does not have admin privileges!!");
                }
                else{
                    next();
                    // return Promise.resolve();
                }
            })
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

         // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */


 /**
 * @swagger
 * /lists:
 *    get:
 *      tags:
 *        - Lists
 *      description: Get List
 *      summary: Get List
 *      responses:
 *          lists:
 *              description: This is the default response for it
  */

/* LIST ROUTES */ 
/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', authenticate, (req, res) => {
// We want to return an array of all the lists in the database that belong to the authenticated user
	
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
       }).catch((e) => {
        res.send(e);
});
})

/**
 * @swagger
 * /lists:
 *    post:
 *      tags:
 *        - Lists
 *      description: Create New List
 *      summary: Create New List
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _userId:
 *                  type: string
 *                  description: enter your userId
 *                title:
 *                  type: string
 *                  description: enter your List Title
  *      responses:
 *        200:
 *          description: Successfully created ;ist
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string
 *               
 *                
 */           
/**

/**
 * post /lists
 * Purpose: create a new list
 */

app.post('/lists', authenticate, (req, res) => {
// We want to create a new list and return the new list document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body	
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
          });

    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
    });

    /**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
   List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });

    });


    /**
 * @swagger
 * /lists/:id:
 *    delete:
 *      tags:
 *        - Delete
 *      summary: Remove List API  
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          description: List id
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Successfully deleted data
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string 
 *                    example: Successfully deleted data! 
 */


   /**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
           }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all tasks in deleted list
        deleteTasksFromList(removedListDoc._id);

           })
});

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    // We want to return all tasks that belong to a specific list (specified by listId)
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});


/**
 * @swagger
 * /lists/:listId/tasks:
 *    post:
 *      tags:
 *        - Tasks
 *      description: Create New Task
 *      summary: Create New Task
 *      requestHeader:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _listId:
 *                  type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _listId:
 *                  type: string
 *                  description: enter your listId
 *                title:
 *                  type: string
 *                  description: enter your task Title
  *      responses:
 *        200:
 *          description: Successfully created Task
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string
 *                    example: Successfully created Task! 
 */           

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // We want to create a new task in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can create new tasks
            return true;
        }

        return false;
    }).then((canCreateTask) => {
        if(canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        }
        else {
            res.sendStatus(404);
        }
    })
})

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // We want to update an existing task (specified by taskId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can update tasks within list
            return true;
        }

        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks){
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })

                
          });
/**
 * @swagger
 * lists/:listId/tasks/:
 *    delete:
 *      tags:
 *        - Delete
 *      summary: Remove Task API  
 *      parameters:
 *        - name: Taskid
 *          in: path
 *          required: true
 *          description: Task id
 *          schema:
 *            type: string
  *        - name: Listid
 *          in: path
 *          required: true
 *          description: list id
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Successfully deleted task
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string
 *                    example: Successfully deleted task!     
 */



/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a task
 */
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can update tasks within list
            return true;
        }

        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        
    } else {
        res.sendStatus(404);
    }})
        }

    );
    
/* USER ROUTES */

/**
 * @swagger
 * /users:
 *    post:
 *      tags:
 *        - Users
 *      description: Create users API
 *      summary: Create users data
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  description: enter your username
 *                password:
 *                  type: string
 *                  description: enter your password
  *      responses:
 *        200:
 *          description: Successfully created User
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string
 *                    example: Successfully created User! 
 *                
 */           

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

 /**
 * @swagger
 * /users/login/:
 *    post:
 *      tags:
 *        - Users
 *      description: Login and Get Access Token
 *      summary: Login and Get Access Token
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  description: enter your username
 *                password:
 *                  type: string
 *                  description: enter your password
  *      responses:
 *        200:
 *          description: Successfully Logged in
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  description:
 *                    type: string
 *                    example: Successfully Logged in!
 *                
 */           

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * PUT /users/:userId
 * Purpose: change password
 */
app.put('/users/:userId', authenticate, (req, res) => {
    // we authenticate before allowing change pw

    User.findOne({
        _id: req.params.userId
    }).then((user) => {
        user.changePw(req.body.password);
        // console.log("and back here as well");
        res.sendStatus(200);
    })
})

/**
 * ONLY FOR TESTING PURPOSES
 * GET /users/:userId
 * Purpose: view password
 */
app.get('/users/:userId', (req, res) => {
    // for testing change pw feature

    User.findOne({
        _id: req.params.userId
    }).then((user) => {
        body = {
            "email": user.email,
            "password": user.password
        }
        res.send(body);
    })

})

/* ADMIN ROUTES */

/**
 * GET /admin
 * Purpose: check if user is admin
 */
app.get('/admin', authenticateAdmin, (req, res) => {
    // authenticateAdmin does all the work
    res.status(200).send("User has admin privileges.");
})

/**
 * GET /users
 * Purpose: get all users
 */
app.get('/users', authenticateAdmin, (req, res) => {
    // for retrieving all users
    User.find({}).then((users) => {
        res.send(users);
    })
})

/**
 * PUT admin/users/:userId/change-password
 * Purpose: admin change password
 */
app.put('/admin/users/:userId/change-password', authenticateAdmin, (req, res) => {
    // we authenticate admin before allowing change pw

    User.findOne({
        _id: req.params.userId
    }).then((user) => {
        user.changePw(req.body.password);
        // console.log("and back here as well");
        res.status(200).send(user);
    })
})

/**
 * PUT admin/users/:userId/change-email
 * Purpose: admin change email
 */
app.put('/admin/users/:userId/change-email', authenticateAdmin, (req, res) => {
    // we authenticate admin before allowing change email
    User.findOne({
        _id: req.params.userId
    }).then((user) => {
        user.changeEmail(req.body.newEmail);
        // console.log("and back here as well");
        res.status(200).send(user);
    })
})

/**
 * POST admin/users/:userId/make-admin
 * Purpose: make user admin
 */
app.post('/admin/users/:userId/make-admin', authenticateAdmin, (req, res) => {
    // we authenticate admin before allowing make admin
    User.findOne({
        _id: req.params.userId
    }).then((user) => {
        user.makeAdmin();
        // console.log("and back here as well");
        res.status(200).send(user);
    })
})

/**
 * DELETE /users/:userId
 * Purpose: delete user
 */
app.delete('/admin/users/:userId/delete-user', authenticateAdmin, (req, res) => {
    // we authenticate admin before allowing change email
    User.findOneAndRemove({
        _id: req.params.userId
    }).then((deletedUser) => {
        res.send(deletedUser);
    })
})

/* ADMIN LIST ROUTES */

/**
 * GET /admin/:userId/lists
 * Purpose: Get all lists
 */
app.get('/admin/:userId/lists', authenticateAdmin, (req, res) => {
    // We want to return an array of all the lists in the database that belong to the user
        
        List.find({
            _userId: req.params.userId
        }).then((lists) => {
            res.send(lists);
           }).catch((e) => {
            res.send(e);
    });
})
    
/**
 * POST /admin/:userId/lists
 * Purpose: create a new list
 */

app.post('/admin/:userId/lists', authenticateAdmin, (req, res) => {
// We want to create a new list and return the new list document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body	
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.params.userId
            });

    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
    });

/**
 * PATCH /admin/:userId/lists/:id
 * Purpose: Update a specified list
 */
app.patch('/admin/:userId/lists/:id', authenticateAdmin, (req, res) => {
    // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.params.userId }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });

    });

/**
 * DELETE /admin/:userId/lists/:id
 * Purpose: Delete a list
 */
app.delete('/admin/:userId/lists/:id', authenticateAdmin, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.params.userId
            }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all tasks in deleted list
        deleteTasksFromList(removedListDoc._id);

            })
});

/**
 * GET /admin/:userId/lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get('/admin/lists/:listId/tasks', authenticateAdmin, (req, res) => {
    // We want to return all tasks that belong to a specific list (specified by listId)
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

/**
 * POST /admin/:userId/lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post('/admin/:userId/lists/:listId/tasks', authenticateAdmin, (req, res) => {
    // We want to create a new task in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.params.userId
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can create new tasks
            return true;
        }

        return false;
    }).then((canCreateTask) => {
        if(canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        }
        else {
            res.sendStatus(404);
        }
    })   
})

/**
 * PATCH /admin/:userId/lists/:listId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.patch('/admin/:userId/lists/:listId/tasks/:taskId', authenticateAdmin, (req, res) => {
    // We want to update an existing task (specified by taskId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.params.userId
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can update tasks within list
            return true;
        }

        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks){
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })

                
            });

/**
 * DELETE /admin/:userId/lists/:listId/tasks/:taskId
 * Purpose: Delete a task
 */
app.delete('/admin/:userId/lists/:listId/tasks/:taskId', authenticateAdmin, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.params.userId
    }).then((list) => {
        if(list) {
            // list object with spec. conditions valid
            // currently authenticated user can update tasks within list
            return true;
        }

        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        
    } else {
        res.sendStatus(404);
    }})
        }

    );

/* HELPER METHODS */

let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + "were deleted.");
    });
}

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})