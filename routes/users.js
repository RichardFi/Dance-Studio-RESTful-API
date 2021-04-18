const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { registerValidation } = require('../validation');
const authorization = require('../validation/authorization');

/*
 * Get all users
 */
router.get('/',
    authorization.verifyToken,
    authorization.grantAccess('readAny', 'user'),
    async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).send(users);
        } catch (err) {
            res.status(400).send({ message: err });
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
        res.statas(400).send(err);
    }
})

router.get('/:userId',
    authorization.verifyToken,
    authorization.grantAccess('readOwn', 'user'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.userId).exec();
            if (user === null) {
                res.json({ message: 'The id is not existed!' })
                return
            }
            else {
                //console.log(post)
                res.json(post);
            }
        } catch (err) {
            //console.log(err)
            res.json({ message: 'The id is not a objectId!' });
        }
    })

router.delete('/:postId', async (req, res) => {
    try {
        const removePost = await Post.deleteOne({ _id: req.params.postId }).exec();
        if (removePost.deletedCount == 1) {
            res.json('Deleted!');
        }
        else {
            res.json('The id is not existed!');
        }
    } catch (err) {
        //console.log(err)
        res.json({ message: 'The id is not a objectId!' });
    }
})

router.patch('/:postId', async (req, res) => {
    try {
        const updatePost = await Post.updateOne(
            { _id: req.params.postId },
            { $set: { title: req.body.title } }
        );
        console.log(updatePost)
        res.json(updatePost);
    } catch (err) {
        //console.log(err)
        res.json({ message: err });
    }
})

module.exports = router;