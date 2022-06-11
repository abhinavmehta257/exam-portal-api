const mongoose = require('mongoose');

const DownloadSubject = new mongoose.Schema({
    title: { type: String, required: true },
});

module.exports = mongoose.model('DownloadSubject', DownloadSubject);
