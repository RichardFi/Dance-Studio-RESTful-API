const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { registerValidation } = require('../validation')
const authorization = require('../validation/authorization')
const jwt = require('jsonwebtoken')
const DanceClass = require('../models/Class')

/*
 * Get users
 * Only admin can access
 */
router.get(
  '/',
  authorization.verifyToken,
  authorization.grantAccess('readAny', 'user'),
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
        }
        const users = await User.find(params)
        res.status(200).send(users)
      } else {
        const users = await User.find()
        res.status(200).send(users)
      }
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

/*
 * Create a new user
 * params: firstName, lastName, gender, phone, email, password
 * success response: the created user's id
 */
router.post('/', async (req, res) => {
  // validate the data before we create a user
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // checking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send('The email already exists')

  // hash passwords
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(req.body.password, salt)

  // create a new user
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    phone: req.body.phone,
    email: req.body.email,
    password: hashPassword
  })

  try {
    await user.save()
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '7d'
    })
    res.status(201).send({ user: user._id, token: token })
  } catch (err) {
    res.statas(400).send({ err: { message: err.message, stack: err.stack } })
  }
})

/*
 * Get a user by user id
 */
router.get(
  '/:userId',
  authorization.verifyToken,
  authorization.grantAccess('readOwn', 'user'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).exec()
      if (user === null) {
        res.status(400).send({ err: 'The id is not existed!' })
      } else {
        // console.log(post)
        res.send(user)
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

/*
 * Get all classes in a given user
 */
router.get(
  '/:userId/classes',
  authorization.verifyToken,
  authorization.grantAccess('readOwn', 'user'),
  async (req, res) => {
    const user = await User.findById(req.params.userId).exec()
    try {
      if (req.query) {
        const params = {}
        for (const prop in req.query) {
          if (req.query[prop]) {
            const obj = {}
            obj.$regex = new RegExp(req.query[prop], 'i')
            params[prop] = obj
          }
        }
        const usersClasses = await DanceClass.find({
          _id: { $in: user.classes },
          ...params
        })
        res.status(200).send(usersClasses)
      } else {
        const usersClasses = await DanceClass.find({
          _id: { $in: user.classes }
        })
        res.status(200).send(usersClasses)
      }
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

/*
 * Get a class in a given user
 */
router.get(
  '/:userId/classes/:classId',
  authorization.verifyToken,
  authorization.grantAccess('readOwn', 'user'),
  async (req, res) => {
    const user = await User.findById(req.params.userId).exec()
    try {
      if (user === null) {
        res.status(400).send({ err: 'The user id is not existed!' })
      } else {
        const usersClass = await DanceClass.findById(req.params.classId)
        if (usersClass === null) {
          res.status(400).send({ err: 'The class id is not existed!' })
        } else {
          res.status(200).send(usersClass)
        }
      }
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

/*
 * Add a user to a class
 */
router.post(
  '/:userId/classes',
  authorization.verifyToken,
  authorization.grantAccess('readOwn', 'user'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).exec()
      const danceClass = await DanceClass.findById(req.body._id).exec()

      if (user === null) {
        res
          .status(400)
          .send({ success: false, message: 'The user id is not existed!' })
      } else if (danceClass === null) {
        res.status(400).send({
          success: false,
          message: 'The dance class id is not existed!'
        })
      } else if (user.classes.includes(danceClass._id)) {
        res.status(400).send({
          success: false,
          message: 'The user has already joint the class!'
        })
      } else {
        await User.findByIdAndUpdate(
          req.params.userId,
          { $push: { classes: req.body._id } },
          { useFindAndModify: false }
        )
        res
          .status(200)
          .send({ success: true, user: user._id, class: req.body._id })
      }
    } catch (err) {
      res.status(400).send({ success: false, message: err.message })
    }
  }
)

/*
 * Remove a user from a class
 */
router.delete(
  '/:userId/classes',
  authorization.verifyToken,
  authorization.grantAccess('readOwn', 'user'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).exec()
      const danceClass = await DanceClass.findById(req.body.classId).exec()

      if (user === null) {
        res.status(400).send({ err: 'The user id is not existed!' })
      } else if (danceClass === null) {
        res.status(400).send({ err: 'The dance class id is not existed!' })
      } else if (!user.classes.includes(danceClass._id)) {
        res.status(400).send({ err: 'The user has not joint the class!' })
      } else {
        await User.findByIdAndUpdate(
          req.params.userId,
          { $pull: { classes: req.body.classId } },
          { useFindAndModify: false }
        )
        res.status(204).send()
      }
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

router.patch(
  '/:userId',
  authorization.verifyToken,
  authorization.grantAccess('updateOwn', 'user'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).exec()
      if (req.user._id !== req.params.userId && user.role !== 'admin') {
        return res
          .status(400)
          .send({ err: 'The id is not consistent with the token!' })
      }
      const params = {}
      // email cannot be changed
      for (const prop in req.body)
        if (req.body[prop] && prop !== 'email') params[prop] = req.body[prop]

      // hash passwords
      if (params.password) {
        const salt = await bcrypt.genSalt(10)
        params.password = await bcrypt.hash(params.password, salt)
      }

      if (user === null) {
        return res.status(400).send({ err: 'The id is not existed!' })
      }
      await User.findByIdAndUpdate(req.params.userId, params, {
        useFindAndModify: false
      })
      res.status(200).send('User profile modified!')
    } catch (err) {
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

router.delete(
  '/:userId',
  authorization.verifyToken,
  authorization.grantAccess('deleteAny', 'user'),
  async (req, res) => {
    try {
      const removeUser = await User.deleteOne({ _id: req.params.userId }).exec()
      if (removeUser.deletedCount === 1) {
        res.status(204).send()
      } else {
        res.status(400).send('The id is not existed!')
      }
    } catch (err) {
      // console.log(err)
      res.status(400).send({ err: { message: err.message, stack: err.stack } })
    }
  }
)

module.exports = router
