const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema ({
  username: {
    type: String,
    required: true,
    unique: true
  },
  userId: String,
  log: [{
    description: String, 
    duration: Number, 
    date: Date 
  }]
});

module.exports = mongoose.model('User', userSchema);
