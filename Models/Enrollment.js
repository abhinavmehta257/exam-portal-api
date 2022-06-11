const mongoose = require("mongoose");
const UserSchema = require('./User');
const CompetitionSchema = require('./Competition');

const EnrollmentsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserSchema.collection.name,
        required: true,
    },
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CompetitionSchema.collection.name,
        required: true,
    },
    payStatus: {
        type: Boolean,
        required: true,
    },
    charges: {
        type: Number,
    },
    status: {
        type: Boolean,
        required: true,
    },
    createDate: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("Enrollments", EnrollmentsSchema);