const CompetitionSchema = require("../Models/Competition");
const PromoCodeSchema = require("../Models/PromoCodeModel");

// Authentication Middelware
module.exports = async (req, res, next) => {
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
        promoCodes
    } = req.body;
    console.log(promoCodes)
    const competitionDetails = CompetitionSchema({
        competitionName: competitionName,
        classId: classIds,
        subjectId: subjectId,
        skills: skills,
        age: age,
        countryId: countryId,
        remark: remark,
        totalQuestion: totalQuestion,
        totalMarks: totalMarks,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        registrationStartDate: new Date(registrationStartDate),
        registrationEndDate: new Date(registrationEndDate),
        discount: discount,
        createDate: new Date(),
        payStatus: payStatus,
        charges: charges,
        status: 0,
        awardStatus: awardType,
        awardDesc: awardDesc,
    });
    try {
        const result = await competitionDetails.save();
        PromoCodeSchema.insertMany(promoCodes.map(ele => ({ ...ele, competitionId: result._id })));
        res.result = result;
        next();
    } catch (err) {
        console.error(err);
        res.json({
            error: err,
            msg: "Competition does not create...",
            msgType: "danger",
        });
    }
};