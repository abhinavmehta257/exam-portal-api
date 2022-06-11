const jwt = require('jsonwebtoken');
const UserSchema = require('../Models/User');

module.exports = function (req, res, next) {
    const secret = 'QUIZ' + process.env.SECRET;
    const ID = req.headers['x-id-token'];

    if (ID) {
        jwt.verify(ID, secret, (err, decoded) => {
            if (err) {
                res.status(401);
                if (err.name === 'JsonWebTokenError') {
                    res.json({
                        error: 'Invalid Key'
                    });
                } else {
                    res.json({
                        error: 'Session Expired'
                    });
                }
            } else {
                req.quesSession = decoded;
                next();
            }
        });
    } else {
        res.status(401);
        res.json({
            error: 'Key Not Found'
        });
    }
}