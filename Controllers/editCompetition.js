var CompetitionSchema = require("../Models/Competition");

const mongoose = require('mongoose');
const PromoCodeModel = require("../Models/PromoCodeModel");
const ObjectId = mongoose.Types.ObjectId;

// Authentication Middelware
module.exports = (req, res, next) => {
    const {
        competitionName,
        subjectId,
        totalQuestion,
        totalMarks,
        skills,
        countryId,
        classIds,
        startDateTime,
        endDateTime,
        age,
        charges,
        remark,
        payStatus,
        registrationStartDate,
        registrationEndDate,
        discount,
        awardType,
        awardDesc,
        id,
        promoCodes,
        promoCodesUpdate
    } = req.body.updatedData;
    const updates = promoCodesUpdate.map(ele => {
        return PromoCodeModel.findByIdAndUpdate(ele._id, {
            value: ele.value,
            isPercentage: ele.isPercentage
        }).exec();
    });

    Promise.all([
        CompetitionSchema
            .findByIdAndUpdate(
                { _id: ObjectId(id) },
                {
                    competitionName: competitionName,
                    classId: classIds,
                    subjectId: subjectId,
                    skills: skills,
                    age: age,
                    countryId: countryId,
                    remark: remark,
                    totalQuestion: totalQuestion,
                    totalMarks: totalMarks,
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    registrationStartDate: registrationStartDate,
                    registrationEndDate: registrationEndDate,
                    discount: discount,
                    createDate: new Date(),
                    payStatus: payStatus,
                    charges: charges,
                    status: 0,
                    awardStatus: awardType,
                    awardDesc: awardDesc,
                }
            ).exec(),
        PromoCodeModel.insertMany(promoCodes.map(ele => ({ ...ele, competitionId: id }))),
        ...updates
    ])
        .then(() => {
            next();
        })
        .catch((error) => {
            console.log(error);
            res.json({
                error: error,
                msg: "Your Competitions has been not been updated",
                msgType: "danger",
            });
        });
};