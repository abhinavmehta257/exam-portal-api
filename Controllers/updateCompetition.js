var CompetitionSchema = require("../Models/Competition");
// Authentication Middelware
module.exports = (req, res, next) => {
    const { competitionId, chooseQues } = req.body;
    const updateCompetitions = { questions: chooseQues }
    CompetitionSchema.findByIdAndUpdate(
        { _id: competitionId },
        updateCompetitions).then((result) => {
            next();
        }).catch((err) => {
            res.json({
                error: err,
                msg: "Competition does not update...",
                msgType: "danger",
            });
        });
}