const router = require('express').Router();

const UserSchema = require('../Models/User');
const JWT = require('../Middleware/JWT');
const asyncHandler = require('../Middleware/asyncHandler');
const Uploads = require('../Middleware/Uploads');
const RolesCheck = require('../Middleware/RolesCheck');
const reqError = require('../Common/ReqError');
const { body, validationResult } = require('express-validator');
const uuid = require('uuid');
const Mongoose = require('mongoose');

// Add a Student.
router.post(
    '/student',
    JWT,
    RolesCheck(['PARENT']),
    body('name', 'Name not found').exists(),
    // body('dob', 'Date of Birth Should Present And Valid').exists().isISO8601().toDate(),
    body('password', 'Minimum Length of Password should be 8').exists().isLength({ min: 6 }),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { classID, dob, password, name } = req.body;

        // TODO: improve name generation algo
        // let uniqueName = name.toLowerCase().replace(' ', '');
        // const count = await UserSchema.find({ email: { $regex: uniqueName + '.*' } }).count().exec();
        // const username = `${uniqueName}${count > 0 ? count + 1 : ''}`;
        const user = new UserSchema({
            // email: username,
            email: uuid.v4(),
            phone: uuid.v4(),
            role: 'STUDENT',
            isVerified: true,
            name,
            profile: null,
            countryID: req.user.countryID,
            dob,
            classID,
            parentID: req.user._id
        });
        user.setPassword(password);

        user.save((err, result) => {
            if (result) {
                // console.log('TODO: Send Email: Username', username)
                res.json({
                    _id: result._id,
                    email: result.email,
                    profile: result.profile,
                    role: user.role,
                    name: user.name
                });
            } else {
                console.error(err);
                if (err.code === 11000) {
                    reqError(res, { message: 'User Already Exists Please Login', code: 11000 });
                } else {
                    reqError(res, 'Database Error', 500);
                }
            }
        });
    })
);

// List all student for a particular parent.
router.get('/students', JWT, RolesCheck(['PARENT']), (req, res) => {
    //  TODO: ADD Payment Information
    UserSchema.find({
        parentID: Mongoose.Types.ObjectId(req.user._id)
    }, 'name email profile', (err, result) => {
        res.json(result || []);
        if (err) {
            console.error(err);
        }
    })
});

// List all Profiles for a particular parent.
router.get('/profiles', JWT, RolesCheck(['PARENT']), (req, res) => {
    UserSchema.find({
        $or: [
            {
                _id: Mongoose.Types.ObjectId(req.user._id)
            },
            {
                parentID: Mongoose.Types.ObjectId(req.user._id)
            }
        ]
    }, 'name email role profile', (err, result) => {
        res.json(result || []);
        if (err) {
            console.error(err);
        }
    })
});

module.exports = router;