const { ROLES } = require('../Common/Constants');

module.exports = function (roles) {
    return async function (req, res, next) {
        if (!req.user)
            return res.status(404).json({ error: 'User not found' });
        const contains = roles.filter(role => ROLES.indexOf(role) > -1);

        if (contains.length > 0) {
            req.roleStr = contains[0];
            next();
        } else
            res.status(401).json({ error: 'UnAuthorized' });
    }
}