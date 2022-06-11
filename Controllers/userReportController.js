const UserSchema = require("../Models/User");
const UserMembershipSchema = require("../Models/UserMembership");
const EnrollmentsSchema = require("../Models/Enrollment");
const CompetitionSchema = require("../Models/Competition");
const moment = require("moment-timezone");


async function getUsersReport(req, res) {
    const date = req.query.date || new Date();
    const count = await UserSchema.count().exec();

    const monthly = await UserSchema.aggregate([
        {
            '$match': {
                'createdAt': {
                    '$exists': true
                }
            }
        }, {
            '$project': {
                'daily': {
                    '$dayOfMonth': '$createdAt'
                },
                'month': {
                    '$month': '$createdAt'
                },
                'year': {
                    '$year': '$createdAt'
                }
            }
        }, {
            '$match': {
                'month': moment(date).month() + 1,
                'year': moment(date).year(),
            }
        }, {
            '$group': {
                '_id': '$daily',
                'count': {
                    '$count': {}
                }
            }
        }
    ]).exec();

    res.json({
        monthly,
        count
    });
}

async function getUserLists(req, res) {
    const { date } = req.query;
    const filters = {};
    if (date) {
        const startRange = moment.tz(date, "UTC").hour(0).minute(0).second(0).millisecond(0);
        filters['createdAt'] = {
            $gte: startRange.format(),
            $lt: startRange.add(1, 'day').format()
        };
    }
    const users = await UserSchema.find(
        filters,
        {
            email: 1,
            name: 1,
            createdAt: 1,
            phone: 1,
            profile: 1,
        },
        {
            sort: {
                createdAt: -1
            }
        }
    )
        .limit(req.page.size)
        .skip(req.page.offset)
        .exec();
    res.json(users);
}

async function getMembershipUsers(req, res) {
    const { date } = req.query;
    let filters = [];
    if (date) {
        const startRange = moment.tz(date, "UTC").hour(0).minute(0).second(0).millisecond(0);
        filters = [{
            $match: {
                startsOn: {
                    $gte: startRange.toDate(),
                    $lt: startRange.add(1, 'day').toDate()
                }
            }
        }];
    }
    const memberships = await UserMembershipSchema.aggregate([
        ...filters,
        {
            '$lookup': {
                'from': 'users',
                'localField': 'user',
                'foreignField': '_id',
                'as': 'user_info'
            }
        }, {
            '$unwind': {
                'path': '$user_info',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$addFields': {
                'user_info.startsOn': '$startsOn'
            }
        }, {
            '$replaceRoot': {
                'newRoot': '$user_info'
            }
        }, {
            '$project': {
                'email': 1,
                'name': 1,
                'startsOn': 1,
                'phone': 1,
                'profile': 1
            }
        }
    ]);
    res.json(memberships);
}

async function getMembershipReport(req, res) {
    const date = req.query.date || new Date();
    const count = await UserMembershipSchema.count().exec();

    const monthly = await UserMembershipSchema.aggregate([
        {
            '$project': {
                'daily': {
                    '$dayOfMonth': '$startsOn'
                },
                'month': {
                    '$month': '$startsOn'
                },
                'year': {
                    '$year': '$startsOn'
                }
            }
        }, {
            '$match': {
                'month': moment(date).month() + 1,
                'year': moment(date).year(),
            }
        }, {
            '$group': {
                '_id': '$daily',
                'count': {
                    '$count': {}
                }
            }
        }
    ]).exec();

    res.json({
        monthly,
        count
    });
}

/**
 * Get Monthly Enrollments.
 * @param {*} req Express Request.
 * @param {*} res Express Response.
 */
async function getEnrollmentsReport(req, res) {
    const date = req.query.date || new Date();
    const count = await EnrollmentsSchema.count().exec();

    const monthly = await EnrollmentsSchema.aggregate([
        {
            '$match': {
                'createDate': {
                    '$exists': true
                }
            }
        }, {
            '$project': {
                'daily': {
                    '$dayOfMonth': '$createDate'
                },
                'month': {
                    '$month': '$createDate'
                },
                'year': {
                    '$year': '$createDate'
                }
            }
        }, {
            '$match': {
                'month': moment(date).month() + 1,
                'year': moment(date).year(),
            }
        }, {
            '$group': {
                '_id': '$daily',
                'count': {
                    '$count': {}
                }
            }
        }
    ]).exec();

    res.json({
        monthly,
        count
    });
}

/**
 * Get Enrollment Users For a Particular Day.
 * @param {*} req Express Request.
 * @param {*} res Express Response.
 */
async function getEnrollmentsUsers(req, res) {
    const { date } = req.query;
    let filters = [];
    if (date) {
        const startRange = moment.tz(date, "UTC").hour(0).minute(0).second(0).millisecond(0);
        filters = [{
            $match: {
                createDate: {
                    $gte: startRange.toDate(),
                    $lt: startRange.add(1, 'day').toDate()
                }
            }
        }];
    }
    const enrollments = await EnrollmentsSchema.aggregate([
        ...filters,
        {
            '$lookup': {
                'from': UserSchema.collection.name,
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }
        },
        {
            '$unwind': {
                'path': '$user',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$lookup': {
                'from': CompetitionSchema.collection.name,
                'localField': 'competitionId',
                'foreignField': '_id',
                'as': 'competition'
            }
        },
        {
            '$unwind': {
                'path': '$competition',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$project': {
                payStatus: 1,
                charges: 1,
                createDate: 1,
                "user.email": 1,
                "user.name": 1,
                "user.phone": 1,
                "user.profile": 1,
                "competition.competitionName": 1
            }
        }
    ]);
    res.json(enrollments);
}

/**
 * For Start Date and End Date get all the Promo Code that is Used.
 * @param {*} req Express Request.
 * @param {*} res Express Response.
 */
async function getAllPromoUsed(req, res) {
    const { start, end } = req.query;
    let startDate = null, endDate = null;
    try {
        if (start)
            startDate = moment.tz(start, "UTC")
                .hour(0)
                .minute(0)
                .second(0)
                .millisecond(0)
                .toDate();
        if (end)
            endDate = moment.tz(end, "UTC")
                .hour(0)
                .minute(0)
                .second(0)
                .millisecond(0)
                .add(1, 'day')
                .toDate();
    } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Invalid" });
    }

    let filters = [];
    if (startDate || endDate) {
        filters = [{
            $match: {
                createDate: {
                }
            }
        }];
        if (startDate) {
            filters[0].$match.createDate['$gte'] = startDate;
        }
        if (endDate) {
            filters[0].$match.createDate['$lt'] = endDate;
        }
    }
    const enrollments = await EnrollmentsSchema.aggregate([
        ...filters,
        {
            $group: {
                _id: "$promo",
                count: {
                    $count: {}
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        }
    ]);
    res.json(enrollments);
}

module.exports = {
    getMembershipReport,
    getUsersReport,
    getUserLists,
    getMembershipUsers,
    getEnrollmentsReport,
    getEnrollmentsUsers,
    getAllPromoUsed
}