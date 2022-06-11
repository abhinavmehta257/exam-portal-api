const router = require('express').Router();

const UserSchema = require('../Models/User');
const CountrySchema = require('../Models/Country');
const JWT = require('../Middleware/JWT');
const Uploads = require('../Middleware/Uploads');
const reqError = require('../Common/ReqError');
const { body, validationResult } = require('express-validator');
const { validateEmail } = require('../Common/Utils');
const uuid = require('uuid');
const asyncHandler = require('../Middleware/asyncHandler');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /users/signup:
 *  post:
 *   tags:
 *    - Users
 *   name: Signup
 *   summary: Signup User.
 *   requestBody:
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       properties:
 *          email:
 *           description: User Email.
 *           type: string
 *          password:
 *           format: password
 *           description: User Password.
 *           type: string
 *          name:
 *           description: User Full Name.
 *           type: string
 *          role:
 *           description: User Role.
 *           type: string
 *          profile:
 *           description: Profile Image of User.
 *           type: string
 *           format: binary
 *      required:
 *       - username
 *       - password
 *       - name
 *       - role
 *   responses:
 *    200:
 *     description: Inserted User Id.
 *    400:
 *     description: Bad Request for some Key.
 *    500:
 *     description: Server Error.
 */
router.post(
    '/signup',
    Uploads.single('profile'),
    body('password').exists().isLength({ min: 6 }).withMessage('Password Should have minimum length 8'),
    body('name').exists(),
    body('country').exists().notEmpty(),
    body('email').optional().isEmail(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { noEmail, password, name, country, email, phone } = req.body;

        if (phone)
            if (phone.length !== 10)
                return reqError(res, 'Phone Number should be of length 10');

        const countryData = await CountrySchema.findOne({
            code: country
        }).exec();

        if (!countryData)
            return reqError(res, 'Country Not Found');

        if ((noEmail === 'true') && !phone)
            return reqError(res, 'Phone Number Not Found');
        else if (!(noEmail === 'true') && !email)
            return reqError(res, 'Email Not Found');

        const user = new UserSchema({
            email: email || uuid.v4(),
            phone,
            role: 'PARENT',
            isVerified: true,
            name,
            profile: (req.file) ? req.file.filename : null,
            countryID: countryData._id,
        });

        // TODO: if OTP Verification is required do here

        user.setPassword(password);

        user.save((err, result) => {
            if (result) {
                res.json({ id: result._id });
            } else {
                console.error(err);
                if (err.code === 11000) {
                    reqError(res, 'User Already Exists Please Login');
                } else {
                    reqError(res, 'Database Error', 500);
                }
            }
        });

    })
);

/**
    * @swagger
    * /users/login:
    *  post:
    *   tags:
    *    - Users
    *   name: Signup
    *   summary: Signup User.
    *   requestBody:
    *    content:
    *     application/json:
    *      schema:
    *       type: object
    *       properties:
    *          email:
    *           description: User Email.
    *           type: string
    *          password:
    *           format: password
    *           description: User Password.
    *           type: string
    *      required:
    *       - username
    *       - password
    *   responses:
    *    200:
    *     description: Returns a Token.
    *    400:
    *     description: Email Not Found
    *    401:
    *     description: Invalid Username or Password.
    *    500:
    *     description: Server Erro.
    */
router.post(
    '/login',
    body('id').exists().notEmpty().withMessage('ID should not be Empty'),
    body('password').exists().notEmpty().withMessage('ID should not be Empty'),
    (req, res) => {
        const { id } = req.body;
        if (!id) return reqError(res, 'ID Not Found');
        UserSchema.findById(id, (err, user) => {
            if (err) {
                console.error(err);
                reqError(res, 'Database Issue', 500);
            } else {
                if (!user) return reqError(res, 'User Not Found!', 401);
                if (user.isBlocked)
                    return reqError(res, 'User is Blocked', 401);
                if (!user.validPassword(req.body.password))
                    return reqError(res, 'Invalid Password!', 401);
                const token = user.setToken();
                res.json({ token });
            }
        });
    }
);


router.post(
    '/loginProfiles',
    body('email').exists(),
    body('password').exists(),
    asyncHandler(async (req, res) => {
        const { email } = req.body;
        if (!email) return reqError(res, 'Email / Phone Not Found');
        let searchBy = { email };
        if (!validateEmail(email)) {
            searchBy = {
                phone: email
            }
        }

        try {
            const user = await UserSchema.findOne(searchBy).exec();
            if (!user) return reqError(res, 'User Not Found!', 401);
            if (user.isBlocked)
                return reqError(res, 'User is Blocked', 401);
            if (!user.validPassword(req.body.password))
                return reqError(res, 'Invalid Password!', 401);
            if (user.role === 'ADMIN') {
                res.json({ isAdmin: true, token: user.setToken() });
                return;
            }

            const profiles = await UserSchema.find({
                $or: [
                    {
                        _id: user._id
                    },
                    {
                        parentID: user._id
                    }
                ]
            }, ['name', 'role', 'profile'], {
                sort: {
                    role: 1
                }
            }).exec()
            res.json({ profiles, token: user.setToken() });
        } catch (err) {
            if (err) {
                console.error(err);
                reqError(res, 'Database Issue', 500);
            }
        }
    })
);

// Info of User
router.get('/info', JWT, (req, res) => {
    res.json({
        name: req.user.name,
        isAdmin: req.user.role === 'ADMIN',
        isParent: req.user.role === 'PARENT',
        profile: req.user.profile
    })
});


// Logout User
router.post('/logout', JWT, (req, res) => {
    // Use if need to save credentials
});

/* Update User For Edit Profile
router.put('/', Uploads.single('profile'), JWT, (req, res) => {
    let update = false;

    // Update email if required
    if (req.body.email) {
        req.user.email = req.body.email;
        update = true;
    }
    // update name if required
    if (req.body.name) {
        req.user.name = req.body.name;
        update = true;
    }

    // Update Profile Picture if required
    if (req.file) {
        req.user.profile = req.file.filename;
        update = true;
    }

    // Update Category if required
    if (req.body.category) {
        req.user.default_category = req.body.category;
        update = true;
    }

    // Update Password if required
    if (req.body.newpassword) {
        if (req.user.validPassword(req.body.password || '')) {
            update = true;
            req.user.setPassword(req.body.newpassword);
        } else return reqError(res, 'Password Not Match!');
    }

    // Save to DB
    if (update) {
        req.user.save((err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database Error!' })
            }
            if (result) {
                res.json({ status: 'Done' });
            } else {
                res.status(400).json({ status: 'User Not Found' });
            }
        });
    } else {
        res.json({ status: 'Done' });
    }

});
*/

// Get User INFO
router.get('/info', JWT, (req, res) => {
    const user = req.user;
    res.json({
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        username: user.username,
        name: user.name,
        profile: user.profile
    });
});

// Delete User
router.delete('/', JWT, (req, res) => {
    UserSchema.findByIdAndDelete(req.user._id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error!' })
        }
        if (result) {
            res.json({ status: 'Done' });
        } else {
            reqError(res, 'User Not Found!')
        }
    });
});

// For Password send otp
router.post(
    '/otp',
    body('email', 'Email/Phone is Required').exists().notEmpty(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email } = req.body;

        const user = await UserSchema.findOne({
            $or: [
                { email },
                { phone: email }
            ]
        }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User Not found. Please Register!' });
        }

        const isEmail = validateEmail(email);
        user.sendOtp(isEmail);

        user.save((err, done) => {
            if (done) {
                res.json({
                    sent: `OTP Sent for this ${isEmail ? 'email' : 'phone'} ${email}`
                });
            } else {
                res.status(500).json({ error: 'Failed to Send Otp' });
                console.log(err);
            }
        });
    })
);

// Verify Otp
router.post(
    '/verify/otp',
    body('email').exists().notEmpty().withMessage('Email/Phone is Required'),
    body('otp', 'Otp is Required').exists().notEmpty().isNumeric(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, otp } = req.body;

        const user = await UserSchema.findOne({
            $or: [
                { email },
                { phone: email }
            ]
        }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User Not found' });
        }

        user.verifyOtp(otp)
            .then(data => res.json(data))
            .catch(err => res.status(400).json(err));
    })
);

router.put('/password',
    body('password').exists().notEmpty()
        .withMessage('Password Should Not be Empty')
        .isLength({ min: 6 })
        .withMessage('Minimum Length Should be 8'),
    body('token').exists().notEmpty(),
    (req, res) => {
        const { password, token } = req.body;
        // TODO: Try Async await

        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                reqError(res, 'Session Timeout');
            } else {
                UserSchema.findById(decoded.temp_id, (dbErr, user) => {
                    if (user) {
                        user.setPassword(password);
                        user.save((dbErr2, done) => {
                            if (done) {
                                res.json({
                                    success: true,
                                    status: 'Password is Updated. Please Login'
                                })
                            } else {
                                reqError(res, 'Failed to Update Password');
                                console.log(dbErr2);
                            }
                        })
                    } else {
                        reqError(res, 'Failed to Update Password');
                        console.log(dbErr);
                    }
                });
            }
        });
    }
);

module.exports = router;