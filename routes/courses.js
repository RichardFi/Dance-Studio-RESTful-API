const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { courseValidation } = require('../validation');
const authorization = require('../validation/authorization');

// Get courses
router.get('/', async (req, res) => {
    try {
        if (req.query) {
            let params = {};
            for (let prop in req.query) if (req.query[prop]){
                let obj = {};
                obj['$regex'] = new RegExp(req.query[prop],'i');
                params[prop] = obj;
            };
            const courses = await Course.find(params);
            res.status(200).send(courses);
        }
        else {
            const courses = await Course.find();
            res.status(200).send(courses);
        }
    } catch (err) {
        res.status(400).send({ message: err });
    }
})

/*
 * Get a course by course id
 */
router.get('/:courseId',
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId).exec();
            if (course === null) {
                res.status(400).send({ err: 'The id is not existed!' })
            }
            else {
                //console.log(post)
                res.send(course);
            }
        } catch (err) {
            //console.log(err)
            res.status(400).send({ err: 'The id is not a objectId!' });
        }
    }
)

/* 
 * Create a new course
 * params: name, type, description, level, teacher, classes
 * success response: the created course's id
 */
router.post('/',
    authorization.verifyToken,
    authorization.grantAccess('updateAny', 'course'),
    async (req, res) => {
        // validate the data before we create a course
        const { error } = courseValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // checking if the course is already in the database
/*         const courseExist = await Course.findOne({ name: req.body.name });
        if (courseExist) return res.status(400).send('The course already exists')
 */
        // create a new course
        const course = new Course({
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            level: req.body.level,
        })

        try {
            const savedCourse = await course.save();
            res.status(201).send({ course: course._id });
        } catch (err) {
            res.statas(400).send(err);
        }
    }
)

/* 
 * Update information of a course
 */
router.patch('/:courseId',
    authorization.verifyToken,
    authorization.grantAccess('updateAny', 'course'),
    async (req, res) => {
        try {
            let params = {};
            for (let prop in req.body) if (req.body[prop]) params[prop] = req.body[prop];
            const updateCourse = await Course.findByIdAndUpdate(
                req.params.courseId,
                params,
                { useFindAndModify: false }
            );
            res.status(200).send("Course information modified!");
        } catch (err) {
            res.status(400).send({ err: err });
        }
    })

/* 
 * Delete a course
 */
router.delete('/:courseId',
    authorization.verifyToken,
    authorization.grantAccess('deleteAny', 'course'),
    async (req, res) => {
        try {
            const removeCourse = await Course.deleteOne({ _id: req.params.courseId }).exec();
            if (removeCourse.deletedCount == 1) {
                res.status(204).send();
            }
            else {
                res.status(400).send('The course id is not existed!');
            }
        } catch (err) {
            //console.log(err)
            res.status(400).send({ err: 'The course id is not a objectId!' });
        }
    })


module.exports = router;