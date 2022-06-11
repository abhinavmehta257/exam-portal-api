const router = require('express').Router();
const CountrySchema = require('../Models/Country');

router.get('/list', (req, res) => {
    CountrySchema.find({
        isDisabled: false
    }, 'name code pricePrefix', (err, result) => {
        if (result) {
            res.json(result);
        } else {
            console.error(err);
            reqError(res, 'Database Error', 500);
        }
    });
});


module.exports = router;