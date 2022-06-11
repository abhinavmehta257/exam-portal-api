const router = require('express').Router();

/**
 * Adding route for different modules.
 */

router.use('/user', require('./User'));
router.use('/parent', require('./Parents'));
router.use('/class', require('./Class'));
router.use('/difficulty', require('./Difficulty'));
router.use('/subject', require('./Subject'));
router.use('/skill', require('./Skill'));
router.use('/country', require('./Country'));
router.use('/question', require('./question'));
router.use('/favourite', require('./Favourite'));
router.use('/subtopic', require('./SubTopic'));
router.use('/query', require('./UserHelp'));
router.use('/download', require('./download'));
router.use('/competition', require('./competition'));
router.use('/reports', require('./Reports'));

module.exports = router;