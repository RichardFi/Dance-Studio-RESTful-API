const mongoose = require('mongoose');

const ClassSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    teachers: {
        type: Array,
        required: true,
    },
})

module.exports = mongoose.model('Classes', ClassSchema);