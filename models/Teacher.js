const mongoose = require('mongoose')

const TeacherSchema = mongoose.Schema({
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
  description: {
    type: String,
    required: true,
  },
  enrolDate: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Teachers', TeacherSchema)
