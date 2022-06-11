const mongoose = require('mongoose');
const Question = require('./Question');
const User = require('./User');

const QuestionLog = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: User.collection.name,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        index: true,
        required: true,
    },
    type: {
        type: String,
        required: true,
        index: true,
        enum: ['START', 'NEXT', 'SUBMIT', 'PREV', 'END'],
        default: 'NEXT'
    },
    questionID: {
        type: mongoose.Types.ObjectId,
        ref: Question.collection.name,
        required: true,
        index: true
    },
    info: { type: Object, required: false, default: null },
    userTime: { type: Date, required: true },
    endTime: { type: Date, required: false, default: null },
    serverTime: { type: Date, required: true },
    // endInfo: { type: Object, required: false, default: null },
});

module.exports = mongoose.model('QuestionLog', QuestionLog);
