const BSONTypeError = require('bson').BSONTypeError;
const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch((err) => {
            if (err instanceof BSONTypeError) {
                console.log(err);
                return res.status(500).json({ error: 'Invalid ID was provided' });
            }
            console.log(err);
            res.status(500).json({ error: 'Something went in the server' });
        });
};

module.exports = asyncHandler;