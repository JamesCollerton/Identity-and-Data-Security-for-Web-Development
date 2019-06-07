var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authorizeRouter = require('./routes/authorize');
var tokenRouter = require('./routes/token');

var OAuthError = require('./lib/error/errors/oautherror');
var oAuthErrorHandler = require('./lib/error/handlers/oautherrorhandler')

// Mongoose and connection to Mongo
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/oauth');

// Generating tokens
var uuid = require('node-uuid');
var token = uuid.v4();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/authorize', authorizeRouter);
app.use('/token', tokenRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404 req: " + req.toString())
  console.log("404 res: " + res.toString())
  next(createError(404));
});

// error handler
app.use(oAuthErrorHandler)

module.exports = app;
