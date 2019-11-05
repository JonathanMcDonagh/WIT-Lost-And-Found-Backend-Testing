#Assignment 1 Agile Software Practice

Name: Jonathan McDonagh

##Overview

WIT Lost And Found is a Web App that allows people to post a 
lost item with their Student ID, Name, WITBuilding, WITRoom,
Lost Item Description. 

I have also included a users model that allows you to add a user
based on email, name and password.

##API endpoints

~~~
(Items)
- Get /items - Get all items.
- Get /item/likes - Get total amount of likes.
- Get /items/total - Get total amount of items.
- Get /items/:id - Get item by ID.
- Get /items/student/:studentid - Get item by student ID.
- Get /rooms/:WITRoom - Get by WIT Room.
- Get /building/:WITBuilding - Get by WIT Building.
- Post /items - Adds a item.
- Post /lostitem/search - Fuzzy Search.
- Put /item/:id/like - Adds like to item.
- Put /item/:id/update - Updates an item.
- Put /item/lostitem/:id/update - Updates lost item description.
- Delete /items/:id - Deletes a item.

(Users)
- Get /users - Get all users.
- Get /users/:id - Get user by ID.
- Get /users/name/:name - Get user by name.
- Post /users - Adds a user.
- Delete /users/:id - Deletes a user.
~~~
##Data Model

Item Example

    {
          "_id": "5dc05f974b1e625f6056255f",
          "studentid": 20074520,
          "name": "Jonathan",
          "WITBuilding": "IT Building",
          "WITRoom": "IT221",
          "lostitem": "USB Type C Charger",
          "likes": 3
     }

User Example

    {
          "_id": "5dc05f984b1e625f60562570",
          "email": "20074520@mail.wit.ie",
          "name": "Jonathan",
          "password": "20074520",
          "posts": 5
     }
     
##Sample Test Execution

    Items
    Successfully connected to witlostandfounddb
    GET /items
    GET /items 200 6.808 ms - 541
      √ should GET all the items
    GET /items/:id
      when the id is valid
    GET /items/5dc064d0d32cd46210171a04 200 2.506 ms - 280
        √ should return the matching item
      when the id is invalid
    GET /items/0000 200 1.493 ms - 220
        √ should return the NOT found message
    GET /items/student/:id
      when the student id is valid
    GET /items/student/20074520 200 1.956 ms - 280
        √ should return the matching item
      when the id is invalid
    GET /items/student/0000 200 1.316 ms - 2
        √ should return the NOT found message
    GET /rooms/:WITRoom
      when the WIT Room id is valid
    GET /rooms/IT221 200 1.993 ms - 280
        √ should return the matching item
      when the WIT Room is invalid
    GET /rooms/0000 200 1.326 ms - 2
        √ should return the NOT found message
    GET /building/:WITBuilding
      when the WIT Building id is valid
    GET /building/IT%20Building 200 2.551 ms - 541
        √ should return the matching item
      when the WIT Building is invalid
    GET /building/0000 200 1.542 ms - 2
        √ should return the NOT found message
    POST /items
      when the the post is successful
    POST /items 200 14.247 ms - 208
        √ should return confirmation message and update datastore
    GET /items/5dc064d0d32cd46210171a16 200 1.668 ms - 273
    PUT /item/:id/like
      when the id is valid
    PUT /item/5dc064d0d32cd46210171a17/like 200 4.905 ms - 215
        √ should return a message and the item liked by 1
    GET /items/5dc064d0d32cd46210171a17 200 1.543 ms - 280
      when the id is invalid
    PUT /items/1100001/like 404 7.690 ms - 11968
        √ should return a 404 and a message for invalid item id
    PUT /item/:id/update
      when the id is valid
    PUT /item/5dc064d0d32cd46210171a1b/update 200 3.386 ms - 218
        √ should return a message and update the entire item
    GET /items/5dc064d0d32cd46210171a1b 200 1.506 ms - 281
      when the id is invalid
    PUT /items/1100001/update 404 1.123 ms - 11968
        √ should return a 404 and a message for invalid item id
    PUT /item/lostitem/:id/update
      when the id is valid
    PUT /item/lostitem/5dc064d0d32cd46210171a1f/update 200 2.636 ms - 213
        √ should return a message and update the lost items description
    GET /items/5dc064d0d32cd46210171a1f 200 1.490 ms - 276
      when the id is invalid
    PUT /items/lostitem/0000/update 404 1.025 ms - 11968
        √ should return a 404 and a message for invalid item id
    DELETE /item/:id
      when the id is valid
    DELETE /items/5dc064d0d32cd46210171a23 200 4.766 ms - 40
        √ should get item with the valid id and delete it
      when the id is invalid
        √ should return a 404 and a message for invalid item id
    GET /items/likes
      when the id is valid
    GET /items/likes 200 1.921 ms - 16
        √ should return the total number of likes
      when the total likes is invalid
    GET /items/likes0 200 0.566 ms - 226
        √ should return the NOT found message
    GET /items/total
      when the id is valid
    GET /items/total 200 1.792 ms - 16
        √ should return the total number of items
      when the total items is invalid
    GET /items/total0 200 0.488 ms - 226
        √ should return the NOT found message
    POST /lostitem/search
      when the the fuzzy search is successful
    POST /lostitem/search 200 3.450 ms - 213
        √ should return confirmation message and the matching values
    GET /items 200 1.763 ms - 541

    Users
    GET /users
    GET /users 200 1.721 ms - 416
      √ should GET all the users
    GET /users/:id
      when the user id is valid
    GET /users/5dc064d0d32cd46210171a33 200 1.908 ms - 210
        √ should return the matching item
      when the user id is invalid
    GET /users/0000 200 0.583 ms - 220
        √ should return the NOT found message
    GET /users/name/:name
      when the user name is valid
    GET /users/name/Jonathan 200 1.602 ms - 210
        √ should return the matching user
      when the user name is invalid
    GET /users/name/0000 200 1.459 ms - 2
        √ should return the NOT found message
    POST /users
      when the the post is successful
    POST /users 200 1.547 ms - 170
        √ should return confirmation message and update datastore
    GET /users/5dc064d0d32cd46210171a3d 200 3.615 ms - 211
    DELETE /users/:id
      when the id is valid
    DELETE /users/5dc064d1d32cd46210171a3e 200 1.694 ms - 40
        √ should get user with the valid id and delete it
      when the id is invalid
        √ should return a 404 and a message for invalid item id

    31 passing (3s)



https://github.com/JonathanMcDonagh/ASG-WIT-Lost-And-Found
