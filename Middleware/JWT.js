const jwt = require('jsonwebtoken');
const UserSchema = require('../Models/User');

module.exports = function (req, res, next) {
    const secret = process.env.SECRET;
    const auth_header = req.headers.authorization;
    const literals = auth_header ? auth_header.split(' ') : null;
    const ID = literals && literals.length == 2 ? literals[1] : null;

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
                        error: 'Key Expired'
                    });
                }
            } else {
                const { id } = decoded;
                UserSchema.findById(id, (err, user) => {
                    if (err || !user || user.isBlocked) {
                        res.status(401).json({
                            error: user.isBlocked ? 'User is Blocked' : 'Unauthorized'
                        })
                    } else {
                        req.user = user;
                        next();
                    }
                });
            }
        });
    } else {
        res.status(401);
        res.json({
            error: 'Key Not Found'
        });
    }
}