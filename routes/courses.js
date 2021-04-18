const express = require('express');
const router = express.Router();
const authorization = require('../validation/authorization');

router.get('/', authorization.verifyToken,
    authorization.grantAccess('readAny', 'user'),
    async (req, res) => {
        res.send(req.user);
    })

module.exports = router;