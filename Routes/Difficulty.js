const router = require('express').Router();
const DifficultySchema = require('../Models/Difficulty');

router.get('/list', (req, res) => {
    DifficultySchema.find({}, 'title', {
        sort: {
            _id: 'ASC'
        }
    }, (err, result) => {
        if (result) {
            res.json(result);
        } else {
            console.error(err);
            reqError(res, 'Database Error', 500);
        }
    });
});


module.exports = router;