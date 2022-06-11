const router = require('express').Router();
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const reqError = require('../Common/ReqError');
const ClassSchema = require('../Models/Class');
const CountrySchema = require('../Models/Country');

router.get('/all/list', JWT, asyncHandler(async (req, res) => {
    ClassSchema.find({}, 'title countryCode', {
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
}));

router.get('/list', JWT, asyncHandler(async (req, res) => {
    const country = await CountrySchema.findById(req.user.countryID).exec();
    if (!country)
        return reqError(res, 'Country Not Found');

    ClassSchema.find({
        countryCode: country.code
    }, 'title', (err, result) => {
        if (result) {
            res.json(result);
        } else {
            console.error(err);
            reqError(res, 'Database Error', 500);
        }
    });
}));


router.get('/filter/:countryCode', function(req, res){
    const {countryCode} = req.params;
    ClassSchema.find({countryCode:countryCode})
        .exec()
        .then((result) => {
            result.sort(function (a,b) {
                return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
            });
            res.status(201).json({
                result: result,
                msg: "",
                msgType: "",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "Country Fetch error...",
                msgType: "danger",
            });
        });
});

module.exports = router;