const mongoose = require('mongoose');

const Difficulty = new mongoose.Schema({
    title: { type: String, required: true },
});

module.exports = mongoose.model('Difficulty', Difficulty);
