const express = require('express');
const router = express.Router();
const danceClass = require('../models/Course');
const { classValidation } = require('../validation');
const authorization = require('../validation/authorization');

// Get all classes
router.get('/', async (req, res) => {
    try {
        const danceClass = await danceClass.find();
        res.status(200).send(courses);
    } catch (err) {
        res.status(400).send({ message: err });
    }
})
