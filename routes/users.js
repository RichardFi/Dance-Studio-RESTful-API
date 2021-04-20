const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { registerValidation } = require('../validation');
const authorization = require('../validation/authorization');

/*
 * Get users 
 * Only admin can access
 */
router.get('/',
    authorization.verifyToken,
    authorization.grantAccess('readAny', 'user'),
    async (req, res) => {
        try {
            if (req.query) {
                let params = {};
                for (let prop in req.query) if (req.query[prop]){
                    let obj = {};
                    obj['$regex'] = new RegExp(req.query[prop],'i');
                    params[prop] = obj;
                };
                const users = await User.find(params);
                res.status(200).send(users);
            }
            else {
                const users = await User.find();
                res.status(200).send(users);
            }

        } catch (err) {
            res.status(400).send({ err: { message: err.message, stack: err.stack } });
        }
    })

/* 
 * Create a new user
 * params: firstName, lastName, gender, phone, email, password
 * success response: the created user's id
 */
router.post('/', async (req, res) => {
    // validate the data before we create a user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('The email already exists')

    // hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // create a new user
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        password: hashPassword,
    })

    try {
        const savedUser = await user.save();
        res.status(201).send({ user: user._id });
    } catch (err) {
        res.statas(400).send({ err: { message: err.message, stack: err.stack } });;
    }
})

/*
 * Get a user by user id
 */
router.get('/:userId',
    authorization.verifyToken,
    authorization.grantAccess('readOwn', 'user'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.userId).exec();
            if (user === null) {
                res.status(400).send({ err: 'The id is not existed!' })
            }
            else {
                //console.log(post)
                res.send(user);
            }
        } catch (err) {
            //console.log(err)
            res.status(400).send({ err: { message: err.message, stack: err.stack } });;
        }
    })

router.patch('/:userId',
    authorization.verifyToken,
    authorization.grantAccess('updateOwn', 'user'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.userId).exec();
            if (req.user._id !== req.params.userId && user.role !== 'admin') {
                return res.status(400).send({ err: 'The id is not consistent with the token!' })
            }
            let params = {};
            // email cannot be changed
            for (let prop in req.body) if (req.body[prop] && prop !== 'email') params[prop] = req.body[prop];

            // hash passwords
            if (params['password']) {
                const salt = await bcrypt.genSalt(10);
                params['password'] = await bcrypt.hash(params['password'], salt);
            }

            if (user === null) {
                return res.status(400).send({ err: 'The id is not existed!' })
            }
            const updateUser = await User.findByIdAndUpdate(
                req.params.userId,
                params,
                { useFindAndModify: false }
            );
            res.status(200).send("User profile modified!");
        } catch (err) {
            res.status(400).send({ err: { message: err.message, stack: err.stack } });
        }
    })

router.delete('/:userId',
    authorization.verifyToken,
    authorization.grantAccess('deleteAny', 'user'),
    async (req, res) => {
        try {
            const removeUser = await User.deleteOne({ _id: req.params.userId }).exec();
            if (removeUser.deletedCount == 1) {
                res.status(204).send();
            }
            else {
                res.status(400).send('The id is not existed!');
            }
        } catch (err) {
            //console.log(err)
            res.status(400).send({ err: { message: err.message, stack: err.stack } });
        }
    })

module.exports = router;