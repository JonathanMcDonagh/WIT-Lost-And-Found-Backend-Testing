var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

const items = require("./routes/items");
const users = require("./routes/users");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);


//Custom Routes
//Student Details
app.get('/student', function (req, res) {
  res.send('STUDENT DETAILS - \n' +
      'Name: Jonathan McDonagh \n' +
      'Student ID: 20074520 \n' +
      'Web App Idea: WIT Lost and Found \n' +
      'Assignment: One');
});


//(ITEMS)
//GET
app.get('/items', items.findAll); //Find all items
app.get('/items/likes', items.findTotalLikes); //Find total likes
app.get('/items/total', items.findTotalPosts); //Find total Posts
app.get('/items/:id', items.findById); //Find by ID
app.get('/items/student/:studentid', items.findByStudentId); //Find by Student ID
app.get('/rooms/:WITRoom', items.findByRoom); //Find by WIT Room
app.get('/building/:WITBuilding', items.findByBuilding); //Find by WIT Building

//POST (ITEMS)
app.post('/items',items.addItem); //Adds item
app.post('/lostitem/search', items.fuzzySearch); //Fuzzy Search

//PUT (ITEMS)
app.put('/item/:id/like', items.incrementLikes); //Adds like to item
app.put('/item/:id/update', items.updateItem); //Updates item
app.put('/item/lostitem/:id/update', items.updateLostItemName); //Updates the lost items description

//Delete (ITEMS)
app.delete('/items/:id', items.deleteItem); //Deletes item


//(USERS)
//GET
app.get('/users', users.findAllUsers); //Find all users
app.get('/users/:id', users.findOneUser); //Find by ID
app.get('/users/name/:name', users.findUserByName); //Find by name

//POST (USERS)
app.post('/users', users.addUser); //Adds a user

//Delete (USERS)
app.delete('/users/:id', users.deleteUser); //Deletes a user


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
