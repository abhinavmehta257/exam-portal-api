const mongoose = require('mongoose');
const Class = require('./Class');
const Subject = require('./Subject');

const Skill = new mongoose.Schema({
    title: { type: String, required: true },
    subjectID: {
        type: mongoose.Types.ObjectId,
        ref: Subject.collection.name,
        required: true,
        index: true
    },
    classID: [{
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    }],
});

module.exports = mongoose.model('Skill', Skill);
