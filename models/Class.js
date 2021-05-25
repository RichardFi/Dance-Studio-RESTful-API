const mongoose = require('mongoose')

const ClassSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  teacher: {
    type: String,
    required: true
  },
  users: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Classes', ClassSchema)
