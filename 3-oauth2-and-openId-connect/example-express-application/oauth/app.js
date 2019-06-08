const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authorizeRouter = require('./routes/authorize');
const tokenRouter = require('./routes/token');

const oAuthErrorHandler = require('./lib/error/handlers/oautherrorhandler')

// Mongoose and connection to Mongo
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/oauth');

// Generating tokens
const app = express();

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
