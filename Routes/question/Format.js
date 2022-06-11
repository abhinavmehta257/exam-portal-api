const router = require('express').Router();
const QuestionFormatSchema = require('../../Models/QuestionFormat');
const JWT = require('../../Middleware/JWT');
const PrivateUploads = require('../../Middleware/PrivateUpload');
const path = require('path');
const ReqError = require('../../Common/ReqError');
const fs = require('fs');
const SAMPLE_DIR = '../../QuestionFormats/';
const reqError = require('../../Common/ReqError');
const { toObjectId, toObjectIdArray } = require('../../Common/Utils');
const InvalidFormatError = require('../../QuestionExcelParsers/InvalidFormatError');
const Format2Parser = require('../../QuestionExcelParsers/Format2');
const Format1Parser = require('../../QuestionExcelParsers/Format1');
const Format1AParser = require('../../QuestionExcelParsers/Format1A');
const Format2AParser = require('../../QuestionExcelParsers/Format2A');
const Format2BParser = require('../../QuestionExcelParsers/Format2B');
const Format2CParser = require('../../QuestionExcelParsers/Format2C');
const Format4Parser = require('../../QuestionExcelParsers/Format4');
const Format3Parser = require('../../QuestionExcelParsers/Format3');
const Format6Parser = require('../../QuestionExcelParsers/Format6');
const Format13Parser = require('../../QuestionExcelParsers/Format13');
const { downloadPrivateFile } = require("../../Common/DownloadFromGCP");

router.get('/list', JWT, (_, res) => {
    QuestionFormatSchema.find({}, 'label title image')
        .sort({
            label: 'ASC'
        }).collation({
            locale: "en_US",
            numericOrdering: true
        }).then((result) => {
            res.json(result);
        }).catch(err => {
            console.error(err);
            reqError(res, 'Database Error', 500);
        });
});

// download Sample
// TODO: Add Roll Check
router.get('/download', JWT, (req, res) => {
    let { id } = req.query;
    if (!id) return reqError(res, 'ID Not Found')
    console.log(id);
    id = id.toLowerCase().replace(/ +/g, '_');
    const fileFolder = path.join(__dirname, SAMPLE_DIR);
    const fileName = `${id}.xlsx`;
    const filePath = path.join(fileFolder, fileName);
    if (fs.existsSync(filePath)) {
        res.sendFile(fileName, {
            root: fileFolder
        });
    } else {
        reqError(res, 'Invalid ID')
    }
});
/**
 * Api To Upload a Excel File of a Specific Format.
 */
router.post('/upload', PrivateUploads.single('file'), (req, res) => {
    if (!req.file)
        return ReqError(res, 'Excel File Not Found');
    const { country, format, subject, skill, difficulty, category } = req.body;
    if (!format)
        return ReqError(res, 'Format Not Found');
    try {
        const options = {};
        if (country)
            options['country'] = country.split(',');
        if (req.body.class)
            options['class'] = toObjectIdArray(req.body.class.split(','), null);
        if (subject)
            options['subject'] = toObjectId(subject);
        if (skill)
            options['skill'] = toObjectId(skill);
        if (difficulty)
            options['difficulty'] = toObjectId(difficulty);
        if (category)
            options['category'] = category;

        downloadPrivateFile(req.file.filename)
            .then((filePath) => {
                if (!filePath)
                    return res.status(500).json({ error: "Failed To Retrieve File From Storage" });
                let parse = null;
                if (format.toLowerCase() === 'frmt_002') {
                    parse = Format2Parser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_001') {
                    parse = Format1Parser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_003') {
                    parse = Format3Parser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_004') {
                    parse = Format4Parser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_001a') {
                    parse = Format1AParser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_002a') {
                    parse = Format2AParser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_002b') {
                    parse = Format2BParser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_002c') {
                    parse = Format2CParser(filePath, options);
                } else if (format.toLowerCase() === 'frmt_013') {
                    parse = Format13Parser(filePath, options);
                }else if (format.toLowerCase() === 'frmt_006') {
                    parse = Format6Parser(filePath, options);
                }else {
                    ReqError(res, 'Invalid Format');
                }

                parse?.then(() => {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(err);
                    });
                    res.json({
                        done: true
                    });
                })?.catch(e => {
                    console.log(e);
                    if (e instanceof InvalidFormatError) {
                        res.status(400).json({ error: e.message });
                    }
                    else {
                        res.status(400).json({ error: 'Invalid File' });
                    }
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({ error: "Failed To Process File" })
            })

        // const filePath = path.join(__filename, '../../../', req.file.path);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Invalid Request Data' });
    }
})

module.exports = router;