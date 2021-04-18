const jwt = require('jsonwebtoken');
const { roles } = require('./roles');

module.exports.verifyToken = function (req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ error: 'Access Denied, please login !' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).send({ error: 'Invalid Token' });
    }
}

module.exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.header('role'))[action](resource);
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
