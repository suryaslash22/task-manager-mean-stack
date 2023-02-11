let chai= require("chai");
let server = require ("../app")
 let chaiHttp = require ("chai-http")

//Assertion Style
chai.should();
chai.use(chaiHttp);

describe('List API', () => {

   
    /**
     * Test the GET Task by listid
     */
    describe("GET /lists/:__listId/tasks", () => {
        it("It should GET a task by ID", (done) => {
            const _id = "63db084b833fc41d1d6fe4c3";
            chai.request(server)                
                .get("/lists/:_id/tasks" )
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('id');
                    response.body.should.have.property('title');
                    response.body.should.have.property('completed');
                    response.body.should.have.property('_id').eq("63db084b833fc41d1d6fe4c3");
                done();
                });
        });

        it("It should NOT GET a task by ID", (done) => {
            const _listId = "123";
            chai.request(server)                
                .get("/lists/:listId/tasks" )
                .end((err, response) => {
                    response.should.have.status(404);
                done();
                });
        });

    });
    /**
     * Test the POST task
     */
    describe("POST '/lists/:listId/tasks", () => {
        it("It should POST a new task", (done) => {
         const _id = "63db084b833fc41d1d6fe4c3";
            const task = {
                name: "Task test",
                completed: false
            };
            chai.request(server)                
                .post("'/lists/:_listId/tasks")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.should.be.a('object');
                    response.body.should.have.property('_id').eq("63db084b833fc41d1d6fe4c3");
                    response.body.should.have.property('title').eq("Task test");
                    response.body.should.have.property('completed').eq(false);
                done();
                });
        });

        it("It should NOT POST a new task without the title property", (done) => {
            const task = {
                completed: false
            };
            chai.request(server)                
                .post("'/lists/:_listId/tasks")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(400);
                   done();
                });
        });

    });

        
    /**
     * Test the PATCH task
     */

    describe("PATCH /lists/:listId/tasks/:taskId", () => {
        it("It should PATCH an existing task", (done) => {
            const taskId = "63c7a7e93d5b912739e14814";
            const task = {
                name: "Task 1 patch"
            };
            chai.request(server)                
                .patch("/lists/:_listId/tasks/:taskId" )
                .send(task)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('id').eq("63c7a7e93d5b912739e14814");
                    response.body.should.have.property('title').eq("Task 1 patch");
                    response.body.should.have.property('completed').eq(true);
                done();
                });
        });

        it("It should NOT PATCH an existing task with a name ", (done) => {
            const taskId = "63c7a7e93d5b912739e14814";
            const task = {
                name: "Title"
            };
            chai.request(server)                
                .patch("/lists/:_listId/tasks/:taskId")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.eq("The name should be at least 3 chars long!");
                done();
                });
        });        
    });
    

    /**
     * Test the DELETE task
     */
    describe("DELETE /lists/:listId/tasks/:taskId", () => {
        it("It should DELETE an existing task", (done) => {
            const taskId = "63c7a7e93d5b912739e14814";
            chai.request(server)                
                .delete("/lists/:listId/tasks/:taskId")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });
        });

        it("It should NOT DELETE a task that is not in the database", (done) => {
            const taskId = "63c7a7e93d5b912739e14814";
            chai.request(server)                
                .delete("/lists/:_listId/tasks/:taskId")
                .end((err, response) => {
                    response.should.have.status(404);
                    response.text.should.be.eq("The task with the provided ID does not exist.");
                done();
                });
        });

    });
     });

