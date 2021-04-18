const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
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
    classes: {
        type: Array,
        required: true,
    },
})

module.exports = mongoose.model('Courses', CourseSchema);