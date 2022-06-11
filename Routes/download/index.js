const asyncHandler = require('../../Middleware/asyncHandler');
const JWT = require('../../Middleware/JWT');
const RolesCheck = require('../../Middleware/RolesCheck');
const PrivateUploads = require('../../Middleware/PrivateUpload');
const { Storage } = require('@google-cloud/storage');
const router = require('express').Router();
const DownloadBookSchema = require('../../Models/DownloadBooks');
const { toObjectIdArray } = require('../../Common/Utils');
const Pagination = require('../../Middleware/Pagination');
router.use('/subject', require('./subject'));
router.use('/exam', require('./exam'));
router.use('/type', require('./types'));


router.post('/',
    JWT,
    RolesCheck(['ADMIN']),
    PrivateUploads.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 },]),
    asyncHandler(async (req, res) => {
        const storage = new Storage({
            projectId: 'superc',
            keyFilename: 'config/superc-6d7bc3b60061.json'
        });
        const thumbnailFilename = req.files['thumbnail'][0].filename;
        const documentFilename = req.files['file'][0].filename;
        if (!thumbnailFilename)
            return res.status(400).json({ error: 'Please Upload a Thumbnail' });
        if (!documentFilename)
            return res.status(400).json({ error: 'Please Upload a Document' });

        await storage.bucket('superc-private-data')
            .file(thumbnailFilename)
            .move(storage.bucket('superc-public-data').file(thumbnailFilename));
        const { title, author, countries, subjects, exams, types, classes, prices } = req.body;
        const isFree = `${req.body.isFree}` === "true";
        const book = DownloadBookSchema({
            title,
            thumbnail: thumbnailFilename,
            popularity: 0,
            author,
            publish_date: new Date(),
            file: isFree ? null : documentFilename,
            free_file: isFree ? documentFilename : null,
            countries: toObjectIdArray(countries.split(",").filter(x => Boolean(x))),
            subjects: toObjectIdArray(subjects.split(",").filter(x => Boolean(x))),
            exams: toObjectIdArray(exams.split(",").filter(x => Boolean(x))),
            classID: toObjectIdArray(classes.split(",").filter(x => Boolean(x))),
            types: toObjectIdArray(types.split(",").filter(x => Boolean(x))),
            price: JSON.parse(prices)
        });

        book.save((err, _) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'Failed To Save Book. Please Fill Items properly'
                });
            }
            res.json({ done: true });
        })
    })
);

router.post('/list', Pagination(15), asyncHandler(async (req, res) => {
    const { filters } = req.body;
    const books = await DownloadBookSchema.find().limit(req.page.size).skip(req.page.offset);
    res.json(books);
}));

module.exports = router;