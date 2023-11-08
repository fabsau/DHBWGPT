// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
require('dotenv').config();

// Import routes
var indexRouter = require('./routes/index');

// Create the Express app
var app = express();

// Set up the view engine and static file directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// Set up middleware for logging and parsing request bodies
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up the routes
app.use('/', indexRouter);

// Catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Export the app
module.exports = app;
