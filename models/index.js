var mongoose = require("mongoose");
mongoose.set('debug', true);
//mongoose.connect('mongodb://localhost/schedule'); 
mongoose.connect('mongodb://liudvis2:miau@ds221609.mlab.com:21609/schedule');
mongoose.Promise = Promise;

module.exports.Schedule = require('./schedule');
module.exports.User = require('./user');
// module.exports.Ip = require('./ip');
