const mongoose = require('mongoose')

const TeacherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 32
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
