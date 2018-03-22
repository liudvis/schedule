var mongoose = require("mongoose");
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/schedule');
mongoose.Promise = Promise;

module.exports.Schedule = require('./schedule');