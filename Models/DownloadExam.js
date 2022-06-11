const mongoose = require('mongoose');
const Country = require('./Country');

const DownloadExam = new mongoose.Schema({
    title: { type: String, required: true },
    countryID: [{
        type: mongoose.Types.ObjectId,
        ref: Country.collection.name,
        required: false,
        index: true
    }],
});

module.exports = mongoose.model('DownloadExam', DownloadExam);
