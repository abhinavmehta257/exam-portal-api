const mongoose = require('mongoose');

const Country = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    pricePrefix: { type: String, required: true },
    isDisabled: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    },
});

module.exports = mongoose.model('Country', Country);
