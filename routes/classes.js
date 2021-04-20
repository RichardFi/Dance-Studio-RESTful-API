const express = require('express');
const router = express.Router();
const danceClass = require('../models/Course');
const { classValidation } = require('../validation');
const authorization = require('../validation/authorization');

// Get all classes
router.get('/', async (req, res) => {
    try {
        if(req.query){
            let params = {};
            for (let prop in req.query) if (req.query[prop]) params[prop] = '{$regex: ' + req.query[prop] + ', $options: "i"}';
            const users = await User.find(params);
            res.status(200).send(users);  
        }
        else{
            const users = await User.find();
            res.status(200).send(users);
        }
    } catch (err) {
        res.status(400).send({ message: err });
    }
})
