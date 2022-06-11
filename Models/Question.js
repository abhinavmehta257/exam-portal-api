const mongoose = require('mongoose');
const Class = require('./Class');
const Country = require('./Country');
const Subject = require('./Subject');
const Difficulty = require('./Difficulty');
const Category = require('./Category');
const QuestionFormat = require('./QuestionFormat');
const Skill = require('./Skill');
const Subtopic = require('./Subtopic');

const Question = new mongoose.Schema({
    title: { type: String, required: true },
    countryID: [{
        type: mongoose.Types.ObjectId,
        ref: Country.collection.name,
        required: true,
        index: true
    }],
    age: { type: Number, required: false },
    classID: [{
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    }],
    subjectID: {
        type: mongoose.Types.ObjectId,
        ref: Subject.collection.name,
        required: false,
        index: true
    },
    difficultID: {
        type: mongoose.Types.ObjectId,
        ref: Difficulty.collection.name,
        required: true,
        index: true
    },
    formatID: {
        type: mongoose.Types.ObjectId,
        ref: QuestionFormat.collection.name,
        required: true,
        index: true
    },
    skillID: {
        type: mongoose.Types.ObjectId,
        ref: Skill.collection.name,
        required: true,
        index: true
    },
    subtopicID: {
        type: mongoose.Types.ObjectId,
        ref: Subtopic.collection.name,
        required: true,
        index: true
    },
    bodyImage: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    hintAudio: { type: String, required: false },
    hintVideo: { type: String, required: false },
    rubricAudio: { type: String, required: false },
    serial: { type: Number, required: true, default: 1 },
    data: { type: Object, required: true },
    answer: { type: Object, required: true },
    category: { type: String, required: false }
});

module.exports = mongoose.model('Question', Question);
