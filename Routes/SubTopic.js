const router = require('express').Router();
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
    const topic = new SubtopicSchema({
        title,
        skillID: ObjectId(req.params.id),
        classID: toObjectIdArray(classes)
    });
    topic.save((err, result) => {
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
    await SubtopicSchema.deleteOne({ _id: id },).exec();
    res.json({
        id
    });
}));


router.get('/list', (req, res) => {
    const { skills } = req.query;
    if (!skills) return res.json([]);
    SubtopicSchema.find({
        $or: skills.split(',').map(ele => ({
            subjectID: ele
        }))
    }, 'title skillID', {
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