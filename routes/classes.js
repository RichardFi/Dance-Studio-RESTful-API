const express = require('express')
const router = express.Router()
const DanceClass = require('../models/Class')
const User = require('../models/User')
const { classValidation } = require('../validation')
const authorization = require('../validation/authorization')

// Get classes
router.get('/', async (req, res) => {
  try {
    if (req.query) {
      const params = {}
      for (const prop in req.query) {
        if (req.query[prop]) {
          const obj = {}
          obj.$regex = new RegExp(req.query[prop], 'i')
          params[prop] = obj
        }
      };
      const danceClasses = await DanceClass.find(params)
      res.status(200).send(danceClasses)
    } else {
      const danceClasses = await DanceClass.find()
      res.status(200).send(danceClasses)
    }
  } catch (err) {
    res.status(400).send({ message: err })
  }
})

/*
 * Get a class by class id
 */
router.get('/:classId',
  async (req, res) => {
    try {
      const danceClasses = await DanceClass.findById(req.params.classId).exec()
      if (danceClasses === null) {
        res.status(400).send({ err: 'The id is not existed!' })
      } else {
        // console.log(post)
        res.send(danceClasses)
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: 'The id is not a objectId!' })
    }
  }
)

/*
 * Get all users in a given class ******need fix
 */
router.get('/:classId/users',
  async (req, res) => {
    try {
      const danceClasses = await DanceClass.findById(req.params.classId).exec().users
      console.log(danceClasses)
      if (req.query) {
        const params = {}
        for (const prop in req.query) {
          if (req.query[prop]) {
            const obj = {}
            obj.$regex = new RegExp(req.query[prop], 'i')
            params[prop] = obj
          }
        };
        res.status(200).send(danceClasses.users)
      } else {
        res.status(200).send(danceClasses.users)
      }
    } catch (err) {
      res.status(400).send({ message: err })
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
    console.log(req.body)
    const { error } = classValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // create a new course
    const danceClass = new DanceClass({
      name: req.body.name,
      course: req.body.course,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      description: req.body.description,
      teacher: req.body.teacher
    })

    try {
      await danceClass.save()
      res.status(201).send({ class: danceClass._id, name: danceClass.name })
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

/*
 * Update class and add an user to a class
 */
router.patch('/:classId',
  authorization.verifyToken,
  authorization.grantAccess('updateOwn', 'class'),
  async (req, res) => {
    try {
      const params = {}
      for (const prop in req.body) if (req.body[prop]) params[prop] = req.body[prop]
      await DanceClass.findByIdAndUpdate(
        req.params.classId,
        params,
        { useFindAndModify: false }
      )
      res.status(200).send({ msg: 'class information changed', classId: req.params.classId })
    } catch (err) {
      res.status(400).send({ err: err })
    }
  })

router.delete('/:classId',
  authorization.verifyToken,
  authorization.grantAccess('deleteAny', 'class'),
  async (req, res) => {
    try {
      const removeClass = await DanceClass.deleteOne({ _id: req.params.classId }).exec()
      if (removeClass.deletedCount === 1) {
        res.status(204).send()
      } else {
        res.status(400).send('The id is not existed!')
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  })
module.exports = router
