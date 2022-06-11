const asyncHandler = require('../../Middleware/asyncHandler');
const JWT = require('../../Middleware/JWT');
const RolesCheck = require('../../Middleware/RolesCheck');
const ReqError = require('../../Common/ReqError');
const DownloadTypesSchema = require('../../Models/DownloadTypes');

const router = require('express').Router();

router.post('/', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title)
        return ReqError(res, "Title Not Found");
    const subject = new DownloadTypesSchema({
        title
    });
    subject.save((err, result) => {
        if (result) {
            res.json({ id: result._id });
        } else {
            console.log(err);
            ReqError(res, 'Failed To Add Subject', 500);
        }
    });
}));

router.get('/list', asyncHandler(async (req, res) => {
    const subjects = await DownloadTypesSchema.find();
    res.json(subjects);
}));

router.delete('/:id', JWT, RolesCheck(['ADMIN']), asyncHandler(async (req, res) => {
    await DownloadTypesSchema.remove({
        _id: req.params.id
    });
    res.json({
        done: true
    });
}));

module.exports = router;