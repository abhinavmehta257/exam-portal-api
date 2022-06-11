const mongoose = require('mongoose');

const Class = new mongoose.Schema({
    title: { type: String, required: true },
    countryCode: { type: String, required: true }
});
Class.index({ countryCode: 1 }, { unique: false, partialFilterExpression: { complete: true } });

module.exports = mongoose.model('Class', Class);
