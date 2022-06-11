const router = require('express').Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const CompetitionSchema = require('../Models/Competition');

const competitionCreate = require("../Controllers/createCompetition");
const updateCompetition = require("../Controllers/updateCompetition");
const editCompetition = require("../Controllers/editCompetition");

const JWT = require('../Middleware/JWT');
const RolesCheck = require('../Middleware/RolesCheck');
const Pagination = require('../Middleware/Pagination');
const PromoCodeModel = require('../Models/PromoCodeModel');

// Admin Auth
router.post('/', JWT, RolesCheck(['ADMIN']), competitionCreate, function (req, res, next) {
    CompetitionSchema
        .aggregate([
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classData",
                },
            },
            {
                $unwind: {
                    path: "$classData",
                },
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subjectData",
                },
            },
            {
                $unwind: {
                    path: "$subjectData",
                },
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryData",
                },
            },
            {
                $unwind: {
                    path: "$countryData",
                },
            },
            {
                $project: {
                    "countryData.isDisabled": 0,
                    "countryData.code": 0,
                    "countryData._id": 0,
                    "subjectData._id": 0,
                },
            },
            {
                $sort: {
                    createDate: -1,
                },
            },
            {
                $limit: 10,
            },
        ])
        .exec()
        .then((result) => {
            res.status(201).json({
                result: result,
                msg: "Competition create successfully...",
                msgType: "success",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "Competition does not create...",
                msgType: "danger",
            });
        });
});


router.get('/', JWT, RolesCheck(['ADMIN']), Pagination(10), function (req, res, next) {
    CompetitionSchema
        .aggregate([
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classData",
                },
            },
            {
                $unwind: {
                    path: "$classData",
                },
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subjectData",
                },
            },
            {
                $unwind: {
                    path: "$subjectData",
                },
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryData",
                },
            },
            {
                $unwind: {
                    path: "$countryData",
                },
            },
            {
                $project: {
                    "countryData.isDisabled": 0,
                    "countryData.code": 0,
                    "countryData._id": 0,
                    "subjectData._id": 0,
                },
            },
            {
                $sort: {
                    createDate: -1,
                },
            },
            {
                $skip: req.page.offset,
            },
            {
                $limit: req.page.size,
            },
        ])
        .exec()
        .then(async (result) => {
            const count = await CompetitionSchema.find({}).countDocuments();
            res.status(201).json({
                result: result,
                perPage: req.page.size,
                count,
                msg: "",
                msgType: "",
            });
        })
        .catch((err) => {
            console.error(err);
            res.json({
                error: err,
                msg: "Coompetition Data Fetch error...",
                msgType: "danger",
            });
        });
})

// Admin Auth
router.put("/competitionstatus/:id/:status", JWT, RolesCheck(['ADMIN']), async (req, res) => {
    const { id, status } = req.params;
    try {
        const updateStatus = await CompetitionSchema.findByIdAndUpdate(
            {
                _id: ObjectId(id),
            },
            {
                status: status,
            }
        );
        return res.status(200).json({
            msg: "status has been updated",
            msgType: "success",
            result: { id: id, status: Number(status) }
        });
    } catch (error) {
        return res.status(500).json({ errors: error, msg: error.message });
    }
})


// Admin Auth
router.delete("/deleteCompetitions/:id/", JWT, RolesCheck(['ADMIN']), async (req, res) => {
    try {
        const response = await CompetitionSchema.findByIdAndRemove(
            ObjectId(req.params.id)
        );
        return res.status(200).json({
            msg: "Competitions has been deleted",
            msgType: "success",
            id: req.params.id,
        });
    } catch (error) {
        return res.status(500).json({ errors: error, msg: error.message });
    }
})


// Admin Auth
router.post('/updateCompetitions', JWT, RolesCheck(['ADMIN']), editCompetition, function (req, res, next) {
    CompetitionSchema
        .aggregate([
            {
                $match: {
                    _id: ObjectId(req.body.updatedData.id),
                },
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classData",
                },
            },
            {
                $unwind: {
                    path: "$classData",
                },
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subjectData",
                },
            },
            {
                $unwind: {
                    path: "$subjectData",
                },
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryData",
                },
            },
            {
                $unwind: {
                    path: "$countryData",
                },
            },
            {
                $project: {
                    "countryData.isDisabled": 0,
                    "countryData.code": 0,
                    "countryData._id": 0,
                    "subjectData._id": 0,
                },
            },
        ])
        .exec()
        .then((result) => {
            res.status(201).json({
                result: result,
                msg: "Competition update successfully...",
                msgType: "success",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "Competition does not update...",
                msgType: "danger",
            });
        });
});


// Admin Auth
router.patch('/', JWT, RolesCheck(['ADMIN']), updateCompetition, function (req, res, next) {
    const { competitionId } = req.body;
    const Id = ObjectId(competitionId);
    CompetitionSchema
        .aggregate([
            {
                $match: {
                    _id: Id,
                },
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classData",
                },
            },
            {
                $unwind: {
                    path: "$classData",
                },
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subjectData",
                },
            },
            {
                $unwind: {
                    path: "$subjectData",
                },
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryData",
                },
            },
            {
                $unwind: {
                    path: "$countryData",
                },
            },
            {
                $project: {
                    "countryData.isDisabled": 0,
                    "countryData.code": 0,
                    "countryData._id": 0,
                    "subjectData._id": 0,
                },
            },
        ])
        .exec()
        .then((result) => {
            res.status(201).json({
                result: result[0],
                msg: "Competition update successfully...",
                msgType: "success",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "Competition does not update...",
                msgType: "danger",
            });
        });
});



router.get('/:fetchCompetitionById/:id', JWT, RolesCheck(['ADMIN']), function (req, res, next) {
    const Id = mongoose.Types.ObjectId(req.params.id);
    CompetitionSchema
        .aggregate([
            {
                $match: {
                    _id: Id,
                },
            },
            {
                $lookup: {
                    from: PromoCodeModel.collection.name,
                    localField: "_id",
                    foreignField: "competitionId",
                    as: "promos",
                },
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classData",
                },
            },
            {
                $unwind: {
                    path: "$classData",
                },
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subjectData",
                },
            },
            {
                $unwind: {
                    path: "$subjectData",
                },
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryData",
                },
            },
            {
                $unwind: {
                    path: "$countryData",
                },
            },
            {
                $project: {
                    "countryData.isDisabled": 0,
                    "countryData.code": 0,
                    "countryData._id": 0,
                    "subjectData._id": 0,
                },
            },
        ])
        .exec()
        .then((result) => {
            res.status(201).json({
                result: result,
                msg: "",
                msgType: "",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "",
                msgType: "",
            });
        });
})

// Delete PromoCode For Competition.
router.delete("/promo/:id", JWT, RolesCheck(['ADMIN']), (req, res) => {
    PromoCodeModel.findByIdAndDelete(req.params.id, (err, _) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: "Failed To Delete" });
        }
        res.json({ done: true });
    })
});

// Update Result Status for Competition.
router.patch("/result/:id", JWT, RolesCheck(['ADMIN']), (req, res) => {
    if (!('resultOut' in req.body))
        return res.status(400).json({ error: "Failed" });
    CompetitionSchema
        .findByIdAndUpdate(req.params.id, { $set: { resultOut: req.body.resultOut } })
        .then(() => {
            res.json({ done: true })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Failed to Update Result" });
        });
});

module.exports = router;