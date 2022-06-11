const router = require('express').Router();
const asyncHandler = require('../Middleware/asyncHandler');
const JWT = require('../Middleware/JWT');
const RolesCheck = require('../Middleware/RolesCheck');
const Pagination = require('../Middleware/Pagination');
const {
    getUsersReport,
    getMembershipReport,
    getUserLists,
    getMembershipUsers,
    getEnrollmentsReport,
    getEnrollmentsUsers,
    getAllPromoUsed
} = require('../Controllers/userReportController');

router.get(
    '/users',
    JWT,
    RolesCheck(['ADMIN']),
    asyncHandler(getUsersReport)
);
// List of Users who have registered on a particular date.
router.get(
    '/users/lists',
    JWT,
    RolesCheck(['ADMIN']),
    Pagination(20),
    asyncHandler(getUserLists)
);
router.get('/memberships', JWT, RolesCheck(['ADMIN']), asyncHandler(getMembershipReport));
// List of Users who have taken membership on a particular date.
router.get(
    '/membership/users',
    JWT,
    RolesCheck(['ADMIN']),
    Pagination(20),
    asyncHandler(getMembershipUsers)
);
// Monthly Enrollments. 
router.get('/enrollments', JWT, RolesCheck(['ADMIN']), asyncHandler(getEnrollmentsReport));
// List of Users who have enrolled on a Course.
router.get(
    '/enrollments/users',
    JWT,
    RolesCheck(['ADMIN']),
    Pagination(20),
    asyncHandler(getEnrollmentsUsers)
);

// List of the All Promo Codes from start Date to End Date.
router.get(
    '/enrollments/promos/all',
    JWT,
    RolesCheck(['ADMIN']),
    asyncHandler(getAllPromoUsed)
);

module.exports = router;