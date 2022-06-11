const router = require('express').Router();
const SubjectSchema = require('../Models/Subject');
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const reqError = require('../Common/ReqError');
const { toObjectIdArray } = require('../Common/Utils');
const RolesCheck = require('../Middleware/RolesCheck');

router.post('/', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {
    const { title, classes } = req.body;
    if (!title)
        return reqError(res, 'Title Not Found');
    if (!classes || (classes.length || 0) <= 0)
        return reqError(res, 'Classes Not Found');
    const subject = new SubjectSchema({
        title,
        classID: toObjectIdArray(classes)
    });
    subject.save((err, result) => {
        if (result) {
            res.json({ id: result._id });
        } else {
            console.log(err);
            reqError(res, 'Database Error', 500);
        }
    });
}));

router.delete('/:id', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {
    const id = req.params.id;
    await SubjectSchema.deleteOne({ _id: id },).exec();
    res.json({
        id
    });
}));

router.get('/list', (req, res) => {
    SubjectSchema.find({}, 'title', {
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


router.get('/complete', async (req, res) => {
    const subjects = await SubjectSchema.aggregate([
        {
            '$lookup': {
                'from': 'skills',
                'let': {
                    'sid': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$sid', '$subjectID'
                                ]
                            }
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'subtopics',
                            'localField': '_id',
                            'foreignField': 'skillID',
                            'as': 'subtopics'
                        }
                    },
                    // {
                    //     '$sort': {
                    //         '_id': 'ASC'
                    //     }
                    // }
                ],
                'as': 'skills'
            }
        }, {
            '$project': {
                'skills.subtopics.skillID': 0,
                'skills.subtopics.__v': 0,
                'skills.subjectID': 0,
                'skills.__v': 0,
                '__v': 0
            }
        }
    ]).exec();
    res.json(subjects);
});


module.exports = router;