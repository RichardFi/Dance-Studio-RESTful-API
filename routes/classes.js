const express = require('express');
const router = express.Router();
const DanceClass = require('../models/Class');
const { classValidation } = require('../validation');
const authorization = require('../validation/authorization');

// Get classes
router.get('/', async (req, res) => {
    try {
        if(req.query){
            let params = {};
            for (let prop in req.query) if (req.query[prop]) params[prop] = '{$regex: ' + req.query[prop] + ', $options: "i"}';
            const danceClasses = await DanceClass.find(params);
            res.status(200).send(danceClasses); 
        }
        else{
            const danceClasses = await DanceClass.find();
            res.status(200).send(danceClasses);
        }
    } catch (err) {
        res.status(400).send({ message: err });
    }
})


/*
 * Get a class by class id
 */
router.get('/:classId',
    async (req, res) => {
        try {
            const danceClasses = await DanceClass.findById(req.params.classId).exec();
            if (danceClasses === null) {
                res.status(400).send({ err: 'The id is not existed!' })
            }
            else {
                //console.log(post)
                res.send(danceClasses);
            }
        } catch (err) {
            //console.log(err)
            res.status(400).send({ err: 'The id is not a objectId!' });
        }
    }
)


/* 
 * Create a new class
 * params: name, course, start time, end time, description, teacher, users
 * success response: the created class's id
 */
router.post('/',
    authorization.verifyToken,
    authorization.grantAccess('updateAny', 'class'),
    async (req, res) => {
        // validate the data before we create a course
        const { error } = classValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // create a new course
        const danceClass = new DanceClass({
            name: req.body.name,
            course: req.body.course,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            description: req.body.description,
            teacher: req.body.teacher,
            users: {}
        })

        try {
            const savedClass = await danceClass.save();
            res.status(201).send({ class: danceClass._id });
        } catch (err) {
            res.statas(400).send(err);
        }
    }
)

module.exports = router;