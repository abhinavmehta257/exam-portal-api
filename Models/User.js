const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../Common/Constants');
const Class = require('./Class');
const Country = require('./Country');
const { sendOTP } = require('../Common/SendMail');


const User = new mongoose.Schema({
    email: { type: String, required: false, unique: true, index: true },// Can be interchangeable with username
    password: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    role: {
        type: String,
        enum: ROLES,
        default: 'PARENT',
        index: true,
    },
    isVerified: { type: Boolean, required: true, default: false },
    isBlocked: { type: Boolean, required: true, default: false },
    name: { type: String, required: true },
    salt: { type: String, required: true },
    countryID: {
        type: mongoose.Types.ObjectId,
        ref: Country.collection.name,
        required: true,
        index: true
    },
    profile: { type: String, required: false },
    id_image: { type: String, required: false },
    dob: { type: Date, required: false },
    otp: { type: String, required: false },
    gender: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    schoolName: {
        type: String,
        required: false,
    },
    zip: {
        type: String,
        required: false,
    },
    classID: {
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    },
    parentID: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: false,
        index: true
    },
    from: {
        type: String,
        default: "SUPERC"
    },
    state: {
        type: String
    },
}, {
    timestamps: true
});


function generateJWToken(data, mins = 30) {
    const today = new Date();
    console.log('For ', mins);
    // if (process.env.NODE_ENV !== 'production') {
    //     exp = new Date(
    //         today.getTime() + 24 * 60 * 60000
    //     )
    // }
    let token = jwt.sign({
        ...data,
        exp: Math.floor(today.getTime() / 1000) + 60 * mins,
    }, process.env.SECRET);
    return token;

}

User.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.password === hash;
};



User.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

User.methods.setToken = function () {
    return generateJWToken({ id: this._id, }, 4 * 600);
}

User.methods.sendOtp = function (isEmail) {
    const otp = Math.floor(899999 * Math.random() + 100000);
    if (isEmail) {
        // Send email
        sendOTP(this.email, otp);
    } else {
        // Send Notification
    }
    // console.log('OTP: ', otp);

    this.otp = generateJWToken({ otp });
}

User.methods.verifyOtp = async function (otp) {
    return new Promise((res, rej) => {
        jwt.verify(this.otp, process.env.SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    rej({
                        error: 'Invalid Key'
                    });
                } else {
                    rej({
                        error: 'Key Expired'
                    });
                }
            } else {
                if (parseInt(decoded.otp, 10) === parseInt(otp, 10)) {
                    res({
                        token: generateJWToken({
                            temp_id: this._id
                        })
                    });
                } else {
                    rej({
                        error: 'Invalid OTP'
                    })
                }
            }
        })
    });
}

module.exports = mongoose.model('User', User);