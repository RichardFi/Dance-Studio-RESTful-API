const jwt = require('jsonwebtoken');
const { roles } = require('./roles');
const User = require('../models/User');

module.exports.verifyToken = function (req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ err: 'Access Denied, please login !' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        // userId
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).send({ err: 'Invalid Token' });
    }
}

module.exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);
            if (user == null){
                return res.status(401).send({ err: 'Invalid Token' });
            }
            const permission = roles.can(user.role)[action](resource);
            
            if (!permission.granted) {
                return res.status(403).send({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}
