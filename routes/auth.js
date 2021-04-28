const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loginValidation } = require('../validation');

// login
router.post('/', async (req, res) => {
    // validate data format before login
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if email existed
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('The email does not exists');

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

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