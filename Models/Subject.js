const mongoose = require('mongoose');
const Class = require('./Class');

const Subject = new mongoose.Schema({
    title: { type: String, required: true },
    classID: [{
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    }],
});

module.exports = mongoose.model('Subject', Subject);
