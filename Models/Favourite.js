const mongoose = require('mongoose');
const User = require('./User');
const Question = require('./Question');

const Favourite = new mongoose.Schema({
    questionID: {
        type: mongoose.Types.ObjectId,
        ref: Question.collection.name,
        required: true,
        index: true
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: User.collection.name,
        required: true,
        index: true
    },
});

Favourite.index({ questionID: 1, userID: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', Favourite);
