const mongoose = require('mongoose');
const Class = require('./Class');
const Skill = require('./Skill');

const Subtopic = new mongoose.Schema({
    title: { type: String, required: true },
    skillID: {
        type: mongoose.Types.ObjectId,
        ref: Skill.collection.name,
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

module.exports = mongoose.model('Subtopic', Subtopic);
