const express = require('express')
const router = express.Router()
const Teacher = require('../models/Teacher')
const bcrypt = require('bcryptjs')
const { teacherValidation } = require('../validation')
const authorization = require('../validation/authorization')
const jwt = require('jsonwebtoken')
const DanceClass = require('../models/Class')

/*
 * Get teachers
 * Only admin can access
 */
router.get('/',
  authorization.verifyToken,
  authorization.grantAccess('readAny', 'teacher'),
  async (req, res) => {
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
        const teachers = await Teacher.find(params)
        res.status(200).send(teachers)
      } else {
        const teachers = await Teacher.find()
        res.status(200).send(teachers)
      }
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)


/*
 * Get a teacher by teacher id
 */
router.get('/:teacherId',
  async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.params.teacherId).exec()
      if (teacher === null) {
        res.status(400).send({ err: 'The id is not existed!' })
      } else {
        // console.log(post)
        res.send(teacher)
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: 'The id is not a objectId!' })
    }
  }
)

/*
 * Create a new teacher
 * params: name
 * success response: the created teacher's id
 */
router.post('/', async (req, res) => {
  // validate the data before we create a teachers
  const { error } = teacherValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // create a new teacher
  const teacher = new Teacher({
    name: req.body.name,
    description: req.body.description
  })

  try {
    await teacher.save()
    res.status(201).send({ teacher: teacher._id })
  } catch (err) {
    res.statas(400).send({ err: { message: err.message, stack: err.stack } })
  }
})


/*
 * Update information of a teacher
 */
router.patch('/:teacherId',
  authorization.verifyToken,
  authorization.grantAccess('updateAny', 'teacher'),
  async (req, res) => {
    try {
      const params = {}
      for (const prop in req.body) if (req.body[prop]) params[prop] = req.body[prop]
      await Teacher.findByIdAndUpdate(
        req.params.teacherId,
        params,
        { useFindAndModify: false }
      )
      res.status(200).send({'message': 'Teacher information modified!'})
    } catch (err) {
      res.status(400).send({ err: err })
    }
  }
)

/*
 * Delete a teacher
 */
router.delete('/:teacherId',
  authorization.verifyToken,
  authorization.grantAccess('deleteAny', 'teacher'),
  async (req, res) => {
    try {
      const removeTeacher = await Teacher.deleteOne({ _id: req.params.teacherId }).exec()
      if (removeTeacher.deletedCount === 1) {
        res.status(204).send()
      } else {
        res.status(400).send('The teacher id is not existed!')
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: 'The teacher id is not a objectId!' })
    }
  }
)


module.exports = router
