const mongoose = require("mongoose");
const CompetitionSchema = require("./Competition");

const PromoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CompetitionSchema.collection.collectionName,
        required: true,
        index: true,
        unique: false
    },
    value: {
        type: Number,
        default: 0,
        required: true,
    },
    isPercentage: {
        type: Boolean,
        default: false,
        required: true,
    }
});

PromoCodeSchema.index({ code: 1, competitionId: 1 }, { unique: true });

module.exports = mongoose.model("promo_code", PromoCodeSchema);
