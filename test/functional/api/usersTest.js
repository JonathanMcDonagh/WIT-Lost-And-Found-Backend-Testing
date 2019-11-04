const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const User = require("../../../models/users");
const { MongoClient } = require("mongodb");


const _ = require("lodash");
let server, mongod, db, url, connection, validID, userName;

describe("Userss", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
                    dbName: "witlostandfounddb" // by default generate random dbName
                }
            });
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            url = await mongod.getConnectionString();

            connection = await MongoClient.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = connection.db(await mongod.getDbName());
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await connection.close();
            await mongod.stop();
            await server.close()
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await User.deleteMany({});
            let user = new User();
            user.email = "20074520@mail.wit.ie";
            user.name = "Jonathan";
            user.password = "20074520";
            user.posts = 0;
            await user.save();
            user = new User();
            user.email = "20074530@mail.wit.ie";
            user.name = "Lauren";
            user.password = "20074530";
            user.posts = 0;
            await user.save();
            user = await User.findOne({email: "20074520@mail.wit.ie"});
            validID = user._id;
            userName = user.name;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /users", () => {
        it("should GET all the users", done => {
            request(server)
                .get("/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        const result = _.map(res.body, user => {
                            return {email: user.email, name: user.name};
                        });
                        expect(result).to.deep.include({email: "20074520@mail.wit.ie", name: "Jonathan"});
                        expect(result).to.deep.include({email: "20074530@mail.wit.ie", name: "Lauren"});
                        done();
                    } catch (e) {
                        done(err);
                    }
                });
        });
    });


    //Gets user by id
    describe("GET /users/:id", () => {
            describe("when the user id is valid", () => {
                it("should return the matching item", done => {
                    request(server)
                        .get(`/users/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("email", "20074520@mail.wit.ie");
                            expect(res.body[0]).to.have.property("name", "Jonathan");
                            done(err);
                        });
                });
            });
        //Return when the user id is invalid
        describe("when the user id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/users/0000")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("User NOT Found!");
                        done(err);
                    });
            });
        });
    });


    //Gets user by name
    describe("GET /users/name/:name", () => {
        describe("when the user name is valid", () => {
            it("should return the matching user", done => {
                request(server)
                    .get(`/users/name/${userName}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("email", "20074520@mail.wit.ie",);
                        expect(res.body[0]).to.have.property("password", "20074520");
                        done(err);
                    });
            });
        });
        //When the username is invalid
        describe("when the user name is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/users/name/0000")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err) => {
                        done(err);
                    });
            });
        });
    });


    //Adds user
    describe("POST /users", () => {
        describe("when the the post is successful", () => {
            it("should return confirmation message and update datastore", () => {
                const item = {
                    email: "20075620@mail.wit.ie",
                    name: "Test Name",
                    password: "20075620",
                    posts: 0
                };
                return request(server)
                    .post("/users")
                    .send(item)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("User Successfully Added!");
                        validID = res.body.data._id;
                    });
            });
            after(() => {
                return request(server)
                    .get(`/users/${validID}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("email", "20075620@mail.wit.ie");
                        expect(res.body[0]).to.have.property("name", "Test Name");
                    });
            });
        });
    });

});
