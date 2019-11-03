let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let uriUtil = require('mongodb-uri');
let Item = require('../models/items');
let Fuse = require('fuse.js');


//var mongodbUri = 'mongodb+srv://jonathanmcdonagh:20074520@web-app-cluster-uct5k.mongodb.net/witlostandfounddb?retryWrites=true&w=majority';
// noinspection JSIgnoredPromiseFromCall
//mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });


mongoose.connect("mongodb://localhost:27017/witlostandfounddb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to connect to [ ' + db.name + ' ]', err);
});
db.once('open', function () {
    console.log('Successfully connected to ' + db.name);
});


//Find all
router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find(function(err, items) {
        if (err)
            res.send(err);
        else
            res.send(JSON.stringify(items,null,5));
    });
};


//Find one by ID
router.findById = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find({ "_id" : req.params.id },function(err, item) {
        if (err)
            res.json({ message: 'Item NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(item,null,5));
    });
};


//Find by WITBuilding
router.findByBuilding = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find({ "WITBuilding" : req.params.WITBuilding },function(err, item) {
        if (err)
            res.json({ message: 'Building NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(item,null,5));
    });
};


//Find by WITRoom
router.findByRoom = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find({ "WITRoom" : req.params.WITRoom },function(err, item) {
        if (err)
            res.json({ message: 'Room NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(item,null,5));
    });
};


//Find by Student ID
router.findByStudentId = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find({ "studentid" : req.params.studentid },function(err, item) {
        if (err)
            res.json({ message: 'Student NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(item,null,5));
    });
};


//Fuzzy Search (fusejs.io)
router.fuzzySearch = (req, res) => {

    Item.find(function (err, items) {
        let options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ['lostitem']
        };

        let fuse = new Fuse(items, options);
        let searchedItem = Item.lostitem = req.body.lostitem; //Request fuzzy value
        let fuseSearch = fuse.search(searchedItem);

        if(searchedItem != null)
            res.json({ message: 'Fuzzy Search: ', fuseSearch});
        else
            res.json({ message: 'You must enter a valid value to search!', err});
    })
};


//Add an item
router.addItem = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    var item = new Item();
    item.studentid = req.body.studentid;
    item.name = req.body.name; //the requested value
    item.WITBuilding = req.body.WITBuilding; //the requested value
    item.WITRoom = req.body.WITRoom; //the requested value
    item.lostitem = req.body.lostitem; //the requested value

    item.save(function(err) {
        if (err)
            res.json({ message: 'Item NOT Added!', errmsg : err } );
        else
            res.json({ message: 'Item Successfully Added!', data: item });
    });
};


//Updates Item
router.updateItem = (req, res) => {

    Item.findById(req.params.id, function(err,item) {
        if (err)
            res.json({ message: 'Item NOT Found!', errmsg : err } );
        else {
            item.studentid = req.body.studentid; //updated value
            item.name = req.body.name; //updated value
            item.WITBuilding = req.body.WITBuilding; //updated value
            item.WITRoom = req.body.WITRoom; //updated value
            item.lostitem = req.body.lostitem; //updated value
            item.likes = req.body.likes; //updated value

            item.save(function (err) {
                if (err)
                    res.json({ message: 'Item NOT updated!', errmsg : err } );
                else
                    res.json({ message: 'Item Successfully updated!', data: item });
            });
        }
    });
};


//Updates Name
router.updateLostItemName = (req, res) => {

    Item.findById(req.params.id, function(err,item) {
        if (err)
            res.json({ message: 'Item NOT Found!', errmsg : err } );
        else {
            item.lostitem = req.body.lostitem; //updated value
            item.save(function (err) {
                if (err)
                    res.json({ message: 'Name NOT updated!', errmsg : err } );
                else
                    res.json({ message: 'Name Successfully updated!', data: item });
            });
        }
    });
};


//Deletes Item
router.deleteItem = (req, res) => {

    Item.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'Item NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'Item Successfully Deleted!'});
    });
};


//Get total Posts
function getTotalPosts() {
    let x = Item.length;
    let totalPosts = 0;
    let err;

    while(x !== totalPosts)
        totalPosts++;
    if(totalPosts === x)
        return totalPosts;
    else
        return err;
}


//find total posts
router.findTotalPosts = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Item.find(function(err, items) {
        if (err)
            res.send(err);
        else
            res.json({ totalPosts : getTotalPosts(items) });
    });
};


//Get Total likes
function getTotalLikes(array) {
    let totalLikes = 0;
    array.forEach(function(obj) { totalLikes += obj.likes; });
    return totalLikes;
}


//find total likes
router.findTotalLikes = (req, res) => {

    Item.find(function(err, items) {
        if (err)
            res.send(err);
        else
            res.json({ totallikes : getTotalLikes(items) });
    });
};


//Add like to item
router.incrementLikes = (req, res) => {

    Item.findById(req.params.id, function(err,item) {
        if (err)
            res.json({ message: 'Item NOT Found!', errmsg : err } );
        else {
            item.likes += 1;
            item.save(function (err) {
                if (err)
                    res.json({ message: 'Item NOT liked!', errmsg : err } );
                else
                    res.json({ message: 'Item Successfully liked!', data: item });
            });
        }
    });
};


module.exports = router;