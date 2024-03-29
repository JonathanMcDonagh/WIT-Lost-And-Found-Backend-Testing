const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const Item = require("../../../models/items")
const { MongoClient } = require("mongodb")

const _ = require("lodash")

let server, mongod, url, connection, validID, studentID, WITBuilding, WITRoom

describe("Items", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database",
          dbName: "witlostandfounddb" // by default generate random dbName
        }
      })
      // Async Trick - this ensures the database is created before
      // we try to connect to it or start the server
      url = await mongod.getConnectionString()

      connection = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      server = require("../../../bin/www")
      //db = connection.db(await mongod.getDbName())
    } catch (error) {
      console.log(error)
    }
  })

  after(async () => {
    try {
      await connection.close()
      await mongod.stop()
      await server.close()
    } catch (error) {
      console.log(error)
    }
  })

  beforeEach(async () => {
    try {
      await Item.deleteMany({})
      let item = new Item()
      item.studentid = 20074520
      item.name = "Jonathan"
      item.WITBuilding = "IT Building"
      item.WITRoom = "IT221"
      item.lostitem = "USB Type C Charger"
      item.likes = 2
      await item.save()
      item = new Item()
      item.studentid = 20074530
      item.name = "Lauren"
      item.WITBuilding = "IT Building"
      item.WITRoom = "ITG17"
      item.lostitem = "Bag"
      await item.save()
      item = await Item.findOne({studentid: 20074520})
      validID = item._id
      studentID = item.studentid
      WITBuilding = item.WITBuilding
      WITRoom = item.WITRoom
    } catch (error) {
      console.log(error)
    }
  })

  //Gets all items
  describe("GET /items", () => {
    it("should GET all the items", done => {
      request(server)
        .get("/items")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            const result = _.map(res.body, item => {
              return {studentid: item.studentid, lostitem: item.lostitem}
            })
            expect(result).to.deep.include({studentid: 20074520, lostitem: "USB Type C Charger"})
            expect(result).to.deep.include({studentid: 20074530, lostitem: "Bag"})
            done()
          } catch (e) {
            done(err)
          }
        })
    })
  })


  //Gets item by id
  describe("GET /items/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching item", done => {
        request(server)
          .get(`/items/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("studentid", 20074520)
            expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger")
            done(err)
          })
      })
    })
    //Return when id is invalid
    describe("when the id is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/items/0000")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("Item NOT Found!")
            done(err)
          })
      })
    })
  })


  //Gets item by student id
  describe("GET /items/student/:id", () => {
    describe("when the student id is valid", () => {
      it("should return the matching item", done => {
        request(server)
          .get(`/items/student/${studentID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("studentid", 20074520)
            expect(res.body[0]).to.have.property("name", "Jonathan")
            done(err)
          })
      })
    })
    //Returns when student id is invalid
    describe("when the id is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/items/student/0000")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
  })


  //Gets item by WITRoom
  describe("GET /rooms/:WITRoom", () => {
    describe("when the WIT Room id is valid", () => {
      it("should return the matching item", done => {
        request(server)
          .get(`/rooms/${WITRoom}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("WITBuilding", "IT Building")
            expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger")
            done(err)
          })
      })
    })
    //Returns when WIT Room is invalid
    describe("when the WIT Room is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/rooms/0000")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
  })


  //Gets item by WITBuilding
  describe("GET /building/:WITBuilding", () => {
    describe("when the WIT Building id is valid", () => {
      it("should return the matching item", done => {
        request(server)
          .get(`/building/${WITBuilding}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("name", "Jonathan")
            expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger")
            done(err)
          })
      })
    })
    //Returns when WIT Building is invalid
    describe("when the WIT Building is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/building/0000")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
  })


  //Posts item
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
        }
        return request(server)
          .post("/items")
          .send(item)
          .expect(200)
          .then(res => {
            expect(res.body.message).equals("Item Successfully Added!")
            validID = res.body.data._id
          })
      })
      after(() => {
        return request(server)
          .get(`/items/${validID}`)
          .expect(200)
          .then(res => {
            expect(res.body[0]).to.have.property("studentid", 20075620)
            expect(res.body[0]).to.have.property("lostitem", "Laptop")
          })
      })
    })
  })


  //Adds like to item
  describe("PUT /item/:id/like", () => {
    describe("when the id is valid", () => {
      it("should return a message and the item liked by 1", () => {
        return request(server)
          .put(`/item/${validID}/like`)
          .expect(200)
          .then(resp => {
            expect(resp.body.data).to.have.property("likes", 3)
          })
      })
      after(() => {
        return request(server)
          .get(`/items/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("likes", 3)
          })
      })
    })
    //Returns when id is invalid
    describe("when the id is invalid", () => {
      it("should return a 404 and a message for invalid item id", () => {
        return request(server)
          .put("/items/1100001/like")
          .expect(404)
      })
    })
  })


  //Updates an item
  describe("PUT /item/:id/update", () => {
    describe("when the id is valid", () => {
      it("should return a message and update the entire item", () => {
        it("should get item with the valid id and update it", done => {
          request(server)
            .get(`/items/${validID}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body[0]).to.have.property("studentid", 20075620)
              expect(res.body[0]).to.have.property("lostitem", "Laptop")
              done(err)
            })
        })
        const itemUpdated = {
          studentid: 20075620,
          name: "Test Name UPDATED",
          WITBuilding: "Business Building",
          WITRoom: "F02",
          lostitem: "Laptop",
          likes: 0
        }
        return request(server)
          .put(`/item/${validID}/update`)
          .send(itemUpdated)
          .expect(200)
          .then(resp => {
            expect(resp.body.data).to.have.property("lostitem", "Laptop")
          })
      })
      after(() => {
        return request(server)
          .get(`/items/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("lostitem", "Laptop")
          })
      })
    })
    //Returns when the id is invalid
    describe("when the id is invalid", () => {
      it("should return a 404 and a message for invalid item id", () => {
        return request(server)
          .put("/items/1100001/update")
          .expect(404)
      })
    })
  })


  //Updates an lost item description
  describe("PUT /item/lostitem/:id/update", () => {
    describe("when the id is valid", () => {
      it("should return a message and update the lost items description", () => {
        it("should get item with the valid id and update the lost item", done => {
          request(server)
            .get(`/item/lostitem/${validID}/update`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body[0]).to.have.property("studentid", 20075620)
              expect(res.body[0]).to.have.property("lostitem", "Laptop")
              done(err)
            })
        })
        const lostItemUpdated = {
          lostitem: "Laptop UPDATED"
        }
        return request(server)
          .put(`/item/lostitem/${validID}/update`)
          .send(lostItemUpdated)
          .expect(200)
          .then(resp => {
            expect(resp.body.data).to.have.property("lostitem", "Laptop UPDATED")
          })
      })
      after(() => {
        return request(server)
          .get(`/items/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("lostitem", "Laptop UPDATED")
          })
      })
    })
    //Returns if updating the item fails
    describe("when the id is invalid", () => {
      it("should return a 404 and a message for invalid item id", () => {
        return request(server)
          .put("/items/lostitem/0000/update")
          .expect(404)
      })
    })
  })


  //Gets item by id and deletes it
  describe("DELETE /item/:id", () => {
    describe("when the id is valid", () => {
      it("should get item with the valid id and delete it", done => {
        request(server)
          .delete(`/items/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
    //Returns when item id is invalid
    describe("when the id is invalid", () => {
      it("should return a 404 and a message for invalid item id", () => {
        request(server)
          .delete("/items/0000")
          .expect(404)
          .expect({message: "Invalid item ID!"})
      })
    })
  })


  //Gets total amount of likes
  describe("GET /items/likes", () => {
    describe("when the id is valid", () => {
      it("should return the total number of likes", done => {
        request(server)
          .get("/items/likes")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
    //Returns when the total likes get route is invalid
    describe("when the total likes is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/items/likes0")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
  })


  //Gets total amount of posts
  describe("GET /items/total", () => {
    describe("when the id is valid", () => {
      it("should return the total number of items", done => {
        request(server)
          .get("/items/total")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
    //Returns when the total posts get route is invalid
    describe("when the total items is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/items/total0")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err) => {
            done(err)
          })
      })
    })
  })


  //Fuzzy Search
  describe("POST /lostitem/search", () => {
    describe("when the the fuzzy search is successful", () => {
      it("should return confirmation message and the matching values", () => {
        const searchedItem = {
          lostitem: "Charger"
        }
        return request(server)
          .post("/lostitem/search")
          .send(searchedItem)
          .expect(200)
          .then(res => {
            expect(res.body.message).equals("Fuzzy Search: ")
          })
      })
      after(() => {
        return request(server)
          .get("/items")
          .expect(200)
          .then(res => {
            expect(res.body[0]).to.have.property("lostitem", "USB Type C Charger")
          })
      })
    })
  })

})