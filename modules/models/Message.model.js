var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  msg: String,
  from: String,
  to: String,
  from_name: String
});

module.exports = mongoose.model('Message', MessageSchema);
