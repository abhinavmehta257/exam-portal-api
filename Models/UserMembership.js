var mongoose = require("mongoose");
var Membership = require('./Membership');
var User = require('./User');

const membershipDetailsSchema = new mongoose.Schema({
    membership: {
        type: mongoose.Types.ObjectId,
        ref: Membership.collection.name,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: User.collection.name,
        required: true,
        index: true,
        unique: false
    },
    startsOn: {
        type: Date,
        required: true,
    },
    expiresOn: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('UserMembership', membershipDetailsSchema)