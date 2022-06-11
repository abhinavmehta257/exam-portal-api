const mongoose = require('mongoose');
const Question = require('./Question');
const User = require('./User');

const UserHelp = new mongoose.Schema({
    message: { type: String, required: true },
    reply: { type: String },
    isSolved: { type: Boolean, required: true, default: false },
    isIgnored: { type: Boolean, required: true, default: false },
    askedOn: { type: Date, required: true },
    questionID: {
        type: mongoose.Types.ObjectId,
        ref: Question.collection.name,
        required: false,
        index: true
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: User.collection.name,
        required: true,
        index: true
    },
});

module.exports = mongoose.model('UserHelp', UserHelp);
