const mongoose = require('mongoose');

const QuestionFormat = new mongoose.Schema({
    label: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: false },
});

module.exports = mongoose.model('QuestionFormat', QuestionFormat);
