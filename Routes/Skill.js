const router = require('express').Router();
const SkillSchema = require('../Models/Skill');
const SubtopicSchema = require('../Models/Subtopic');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const reqError = require('../Common/ReqError');
const { toObjectIdArray } = require('../Common/Utils');
const RolesCheck = require('../Middleware/RolesCheck');

router.post('/:id', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {
    const { title, classes } = req.body;
    if (!title)
        return reqError(res, 'Title Not Found');
    if (!classes || (classes.length || 0) <= 0)
        return reqError(res, 'Classes Not Found');
    const skill = new SkillSchema({
        title,
        subjectID: ObjectId(req.params.id),
        classID: toObjectIdArray(classes)
    });
    skill.save((err, result) => {
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
    await SkillSchema.deleteOne({ _id: id },).exec();
    res.json({
        id
    });
}));

router.get('/all', (req, res) => {
    SkillSchema.find({}, 'title', (err, result) => {
        if (result) {
            res.json(result);
        } else {
            console.error(err);
            reqError(res, 'Database Error', 500);
        }
    });
});

router.get('/list', (req, res) => {
    const { subject } = req.query;
    if (!subject) return reqError(res, 'Invalid Subject');
    SkillSchema.find({
        $or: subject.split(',').map(ele => ({
            subjectID: ele
        }))
    }, 'title', (err, result) => {
        if (result) {
            res.json(result);
        } else {
            console.error(err);
            reqError(res, 'Database Error', 500);
        }
    });
});


router.get('/list/subtopics', async (req, res) => {
    const { subjects } = req.query;
    if (!subjects) return ReqError(res, 'Invalid Subject');
    const skills = await SkillSchema.aggregate([
        {
            $match: {
                $or: subjects.split(',').map(ele => ({
                    subjectID: new ObjectId(ele)
                }))
            }
        }, {
            $lookup: {
                from: SubtopicSchema.collection.name,
                let: {
                    sid: '$_id'
                },
                pipeline: [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$sid', '$skillID'
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }
                ],
                // localField: '_id',
                // foreignField: 'skillID',
                as: 'subtopics'
            }
        },
        {
            '$project': {
                '_id': 1,
                'title': 1,
                'subtopics._id': 1,
                'subtopics.title': 1
            }
        },
        {
            $sort: {
                '_id': 1,
            }
        },
    ]).exec();
    // console.log(JSON.stringify(skills));
    res.json(skills);
})

module.exports = router;