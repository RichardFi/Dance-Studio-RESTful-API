const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    max: 16
  },
  lastName: {
    type: String,
    required: true,
    max: 16
  },
  gender: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true,
    min: 8,
    max: 16
  },
  registerDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'basic'
  },
  classes: {
    type: [String],
    default: []
  }
})

module.exports = mongoose.model('Users', UserSchema)
