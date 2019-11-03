const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Item = require("../../../models/items");
const mongoose = require("mongoose");

const _ = require("lodash");
let server, mongod, db, validID, studentID, WITBuilding, WITRoom;

describe("Itemss", () => {
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
            await mongod.getConnectionString();

            mongoose.connect("mongodb://localhost:27017/witlostandfounddb", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await db.dropDatabase();
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await Item.deleteMany({});
            let item = new Item();
            item.studentid = 20074520;
            item.name = "Jonathan";
            item.WITBuilding = "IT Building";
            item.WITRoom = "IT221";
            item.lostitem = "USB Type C Charger";
            item.likes = 2;
            await item.save();
            item = new Item();
            item.studentid = 20074530;
            item.name = "Lauren";
            item.WITBuilding = "IT Building";
            item.WITRoom = "ITG17";
            item.lostitem = "Bag";
            await item.save();
            item = await Item.findOne({studentid: 20074520});
            validID = item._id;
            studentID = item.studentid;
            WITBuilding = item.WITBuilding;
            WITRoom = item.WITRoom;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /items", () => {
        it("should GET all the items", done => {
            request(server)
                .get("/items")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        const result = _.map(res.body, item => {
                            return {studentid: item.studentid, lostitem: item.lostitem};
                        });
                        expect(result).to.deep.include({studentid: 20074520, lostitem: "USB Type C Charger"});
                        expect(result).to.deep.include({studentid: 20074530, lostitem: "Bag"});
                        done();
                    } catch (e) {
                        done(err);
                    }
                });
        });
    });


    describe("GET /items/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching item", done => {
                request(server)
                    .get(`/items/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("studentid", 20074520);
                        expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger");
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/items/0000")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Item NOT Found!");
                        done(err);
                    });
            });
        });
    });


    describe("GET /items/student/:id", () => {
        describe("when the student id is valid", () => {
            it("should return the matching item", done => {
                request(server)
                    .get(`/items/student/${studentID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("studentid", 20074520);
                        expect(res.body[0]).to.have.property("name", "Jonathan");
                        done(err);
                    });
            });
        });

        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/items/student/9999")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });
    });


    describe("GET /rooms/:WITRoom", () => {
        describe("when the WIT Room id is valid", () => {
            it("should return the matching item", done => {
                request(server)
                    .get(`/rooms/${WITRoom}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("WITBuilding", "IT Building");
                        expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger");
                        done(err);
                    });
            });
        });

        describe("when the WIT Room is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/rooms/0000")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });
    });


    describe("POST /items", () => {
        describe("when the the post is successful", () => {
            it("should return confirmation message and update datastore", () => {
                const item = {
                    studentid: 20075620,
                    name: "Test Name",
                    WITBuilding: "Business Building",
                    WITRoom: "F02",
                    lostitem: "Laptop",
                    likes: 0
                };
                return request(server)
                    .post("/items")
                    .send(item)
                    .expect(200)
                    .then(res => {
                        //expect(res.body.message).equals("Item Added!");
                        validID = res.body.data._id;
                    });
            });
            after(() => {
                return request(server)
                    .get(`/items/${validID}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("studentid", 20075620);
                        expect(res.body[0]).to.have.property("lostitem", "Laptop");
                    });
            });
        });
    });


    describe("PUT /item/:id/like", () => {
        describe("when the id is valid", () => {
            it("should return a message and the item liked by 1", () => {
                return request(server)
                    .put(`/item/${validID}/like`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.data).to.have.property("likes", 3);
                    });
            });
            after(() => {
                return request(server)
                    .get(`/items/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("likes", 3);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a 404 and a message for invalid item id", () => {
                return request(server)
                    .put("/items/1100001/like")
                    .expect(404);
            });
        });
    });


    describe("PUT /item/:id/update", () => {
        describe("when the id is valid", () => {
            it("should return a message and update the item", () => {
                it("should get item with the valid id and update it", done => {
                    request(server)
                        .get(`/items/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("studentid", 20075620);
                            expect(res.body[0]).to.have.property("lostitem", "Laptop");
                            done(err);
                        });
                });
                const itemUpdated = {
                    studentid: 20075620,
                    name: "Test Name UPDATED",
                    WITBuilding: "Business Building",
                    WITRoom: "F02",
                    lostitem: "Laptop",
                    likes: 0
                };
                return request(server)
                    .put(`/item/${validID}/update`)
                    .send(itemUpdated)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.data).to.have.property("lostitem", "Laptop");
                    });
            });
            after(() => {
                return request(server)
                    .get(`/items/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("lostitem", "Laptop");
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a 404 and a message for invalid item id", () => {
                return request(server)
                    .put("/items/1100001/update")
                    .expect(404);
            });
        });
    });


    describe("PUT /item/lostitem/:id/update", () => {
        describe("when the id is valid", () => {
            it("should return a message and update the lost item", () => {
                it("should get item with the valid id and update the lost item", done => {
                    request(server)
                        .get(`/item/lostitem/${validID}/update`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("studentid", 20075620);
                            expect(res.body[0]).to.have.property("lostitem", "Laptop");
                            done(err);
                        });
                });
                const lostItemUpdated = {
                    lostitem: "Laptop UPDATED"
                };
                return request(server)
                    .put(`/item/lostitem/${validID}/update`)
                    .send(lostItemUpdated)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.data).to.have.property("lostitem", "Laptop UPDATED");
                    });
            });
            after(() => {
                return request(server)
                    .get(`/items/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("lostitem", "Laptop UPDATED");
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a 404 and a message for invalid item id", () => {
                return request(server)
                    .put("/items/lostitem/0000/update")
                    .expect(404);
            });
        });
    });

});