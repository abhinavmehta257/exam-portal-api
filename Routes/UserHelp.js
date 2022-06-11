const ReqError = require('../Common/ReqError');
const { toObjectId } = require('../Common/Utils');
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const Pagination = require('../Middleware/Pagination');
const RolesCheck = require('../Middleware/RolesCheck');
const UserHelpSchema = require('../Models/UserHelp');
const router = require('express').Router();

// Get My Queries.
router.get('/my', JWT, RolesCheck(['STUDENT']), Pagination(15), asyncHandler(async (req, res) => {
    const messages = await UserHelpSchema.find({
        userID: req.user._id
    }, 'message askedOn isSolved')
        .sort({
            'askedOn': 'DESC',
            'isSolved': 'ASC'
        })
        .skip(req.page.offset)
        .limit(req.page.size).exec();
    res.json(messages);
}));

// Ask a Query
router.post('/', JWT, RolesCheck(['STUDENT']), asyncHandler(async (req, res) => {
    const { questionId, message } = req.body;
    if (!message)
        return ReqError(res, 'Message is Empty');
    const help = new UserHelpSchema({
        message,
        questionId,
        askedOn: new Date(),
        questionID: questionId ? toObjectId(questionId) : null,
        userID: req.user._id
    });
    help.save((err, result) => {
        if (result) {
            res.json({
                id: result._id
            });
        }
        else {
            console.error(err);
            return ReqError(res, 'Failed to Add Help', 500)
        }
    })
}));

// Single Query.
router.get('/single/:id', JWT, RolesCheck(['STUDENT']), Pagination(15), asyncHandler(async (req, res) => {
    const item = await UserHelpSchema.aggregate([
        {
            '$match': {
                '_id': toObjectId(req.params.id),
                'userID': toObjectId(req.user._id)
            }
        },
        {
            '$lookup': {
                'from': 'questions',
                'localField': 'questionID',
                'foreignField': '_id',
                'as': 'question'
            }
        },
        {
            '$unwind': {
                'path': '$question',
                'preserveNullAndEmptyArrays': true
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
                _id: 1,
                askedOn: 1,
                isSolved: 1,
                reply: 1,
                message: 1,
            }
        }
    ]).exec();
    if (item.length > 0) {
        res.json(item[0]);
    } else ReqError(res, "Query Not Found")
}));

// Delete a Query
router.delete('/:id', JWT, RolesCheck(['STUDENT']), asyncHandler(async (req, res) => {
    UserHelpSchema.remove({
        userID: req.user._id,
        _id: req.params.id,
    }, (err) => {
        if (err) {
            return ReqError(res, 'Failed to Remove Query', 500);
        } else {
            res.json({
                done: true
            });
        }
    });
}));

// List Unsolved Queries
router.get('/my', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {

}));



module.exports = router;