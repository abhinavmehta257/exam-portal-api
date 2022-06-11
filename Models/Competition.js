const mongoose = require('mongoose');
const Class = require('./Class');
const Country = require('./Country');
const Subject = require('./Subject');

const competitionsSchema = new mongoose.Schema({
    competitionName: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    },
    subjectId: {
        type: mongoose.Types.ObjectId,
        ref: Subject.collection.name,
        required: false,
        index: true
    },
    skills: {
        type: String,
    },
    age: {
        type: String,
        required: true,
    },
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country.collection.name,
        required: true,
        index: true
    },
    remark: {
        type: String,
    },
    totalQuestion: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    questions: {
        type: Array,
    },
    startDateTime: {
        type: Date,
        required: true,
    },
    endDateTime: {
        type: Date,
        required: true,
    },
    registrationStartDate: {
        type: Date,
        required: true,
    },
    registrationEndDate: {
        type: Date,
        required: true,
    },
    payStatus: {
        type: Boolean,
        required: true,
    },
    charges: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    promoCodeStatus: {
        type: Boolean,
    },
    promoCode: {
        type: String,
    },
    promoCodeAmount: {
        type: Number,
    },
    awardStatus: {
        type: Boolean,
        required: true
    },
    awardDesc: {
        type: String,
    },
    status: {
        type: Number,
        required: true,
    },
    createDate: {
        type: Date,
        required: true,
    },
    resultOut: {
        type: Boolean,
        required: true,
        default: false,
    }
});

module.exports = mongoose.model('competitions', competitionsSchema);