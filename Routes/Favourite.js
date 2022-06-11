const router = require('express').Router();
const RolesCheck = require('../Middleware/RolesCheck');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const FavouriteSchema = require('../Models/Favourite');
const QuestionSchema = require('../Models/Question');
const reqError = require('../Common/ReqError');
const Pagination = require('../Middleware/Pagination');

// Create
router.post('/', JWT, RolesCheck(['STUDENT']), asyncHandler(async (req, res) => {
    const { question } = req.body;
    if (!question) return reqError(res, 'Invalid Question');
    const favour = new FavouriteSchema({
        questionID: new ObjectId(question),
        userID: req.user._id
    });
    favour.save((err, result) => {
        if (result) {
            res.json({
                id: result._id
            });
        } else {
            if (err.code === 11000) {
                return res.json({
                    id: true
                });
            }
            console.log(err);
            reqError(res, 'Failed to Add Favourite');
        }
    })
}));

// Delete
router.delete('/:id', JWT, RolesCheck(['STUDENT']), asyncHandler(async (req, res) => {
    const fav = await FavouriteSchema.deleteOne({
        _id: new ObjectId(req.params.id),
        userID: req.user._id
    });
    if (fav.deletedCount) {
        res.json({});
    } else {
        reqError(res, 'Already Removed');
    }
}));

// List
router.get('/', JWT, RolesCheck(['STUDENT']), Pagination(15), asyncHandler(async (req, res) => {
    const favors = await FavouriteSchema.aggregate([
        {
            '$match': {
                'userID': req.user._id
            }
        },
        {
            $sort: {
                _id: -1,
            }
        },
        {
            '$skip': req.page.offset
        },
        {
            '$limit': req.page.size
        },
        {
            '$lookup': {
                'from': QuestionSchema.collection.name,
                'localField': 'questionID',
                'foreignField': '_id',
                'as': 'question'
            }
        },
        {
            '$unwind': {
                'path': '$question',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            $project: {
                'question._id': 1,
                'question.title': 1,
                'question.formatID': 1,
                'question.bodyImage': 1,
                'question.description': 1,
                'question.data': 1,
            }
        },
    ]);
    res.json(favors)
}));

module.exports = router;