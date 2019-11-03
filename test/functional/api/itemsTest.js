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
            await item.save();
            item = new Item();
            item.studentid = 20074530;
            item.name = "Lauren";
            item.WITBuilding = "IT Building";
            item.WITRoom = "ITG17";
            item.lostitem = "Bag";
            await item.save();
            item = await Item.findOne({ studentid: 20074520 });
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
                    try{
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


});