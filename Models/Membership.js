const mongoose = require('mongoose');

const Membership = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    permissions: { type: [String], required: true },
});

module.exports = mongoose.model('Membership', Membership);
