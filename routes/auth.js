const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loginValidation } = require('../validation');

// Get user by token to check the login status
router.get('/',
    async (req, res) => {
        const authHeader = req.headers['authorization']
        
        const token = authHeader && authHeader.split(' ')[1]
        //console.log(authHeader)
        if (!token) return res.status(401).send({ err: 'Access Denied, please login !' });

        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            // userId
            return res.status(200).send({ user: verified });
        } catch (err) {
            res.status(401).send({ err: 'Invalid Token' });
        }
    })

// login
router.post('/', async (req, res) => {
    // validate data format before login
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send({message:'Invalid email or password format'});

    // check if email existed
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({message:'The email does not exists'});

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send({message:'Invalid password'});

    // create and assign a token
    const token = jwt.sign({ _id: user._id },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "7d"
        });

    return res.header('auth-token', token).status(200).send({ role: user.role, token: token });

    //res.send('Logged in!');
})

module.exports = router;