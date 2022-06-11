const mongoose = require('mongoose');

const DownloadTypes = new mongoose.Schema({
    title: { type: String, required: true },
});

module.exports = mongoose.model('DownloadTypes', DownloadTypes);
