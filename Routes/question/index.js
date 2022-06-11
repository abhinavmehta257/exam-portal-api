const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const reqError = require('../../Common/ReqError');
const JWT = require('../../Middleware/JWT');
const SAMPLE_DIR = '../../QuestionFormats/';
const SubjectSchema = require('../../Models/Subject');
const SkillSchema = require('../../Models/Skill');
const SubtopicSchema = require('../../Models/Subtopic');
const DifficultSchema = require('../../Models/Difficulty');
const QuestionFormat = require('../../Models/QuestionFormat');
const QuestionSchema = require('../../Models/Question');
const uuid = require('uuid');
const jsonToken = require('jsonwebtoken');
const QuestionLog = require('../../Models/QuestionLog');
const { Types } = require('mongoose');
var mongoose = require('mongoose');
const QuestionSession = require('../../Middleware/QuestionSession');
const { randomShuffle } = require('../../Common/Utils');
const asyncHandler = require('../../Middleware/asyncHandler');
const checkAnswer = require('../../QuestionExcelParsers/CheckAnswer');
const RolesCheck = require('../../Middleware/RolesCheck');
const Pagination = require('../../Middleware/Pagination');


const ObjectId = Types.ObjectId;
const PER_PAGE = 15;

router.use('/format', require('./Format'));
// TODO: Modify names
router.get('/list/:id', JWT, RolesCheck(['ADMIN']), Pagination(PER_PAGE), asyncHandler(async (req, res) => {
    const questions = await QuestionSchema.aggregate([
        {
            '$match': {
                'formatID': new ObjectId(req.params.id)
            }
        },
        {
            $sort: {
                _id: -1,
            }
        },
        {
            '$skip': req.page.offset
        },
        {
            '$limit': req.page.size
        },
        {
            '$lookup': {
                'from': 'skills',
                'localField': 'skillID',
                'foreignField': '_id',
                'as': 'skill'
            }
        },
        {
            '$unwind': {
                'path': '$skill',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$lookup': {
                'from': 'difficulties',
                'localField': 'difficultID',
                'foreignField': '_id',
                'as': 'difficulty'
            }
        },
        {
            '$unwind': {
                'path': '$difficulty',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$lookup': {
                'from': 'subjects',
                'localField': 'subjectID',
                'foreignField': '_id',
                'as': 'subject'
            }
        },
        {
            '$unwind': {
                'path': '$subject',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$lookup': {
                'from': 'subtopics',
                'localField': 'subtopicID',
                'foreignField': '_id',
                'as': 'subtopic'
            }
        },
        {
            '$unwind': {
                'path': '$subtopic',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$lookup': {
                'from': 'countries',
                'localField': 'countryID',
                'foreignField': '_id',
                'as': 'country'
            }
        },
        {
            '$lookup': {
                'from': 'classes',
                'localField': 'classID',
                'foreignField': '_id',
                'as': 'classes'
            }
        },
        {
            $project: {
                countryID: 0,
                classID: 0,
                subjectID: 0,
                difficultID: 0,
                formatID: 0,
                skillID: 0,
                subtopicID: 0,
                __v: 0,
                "difficulty._id": 0,
                "difficulty.__v": 0,
                "skill._id": 0,
                "skill.subjectID": 0,
                "skill.__v": 0,
                "subtopic._id": 0,
                "subtopic.skillID": 0,
                "subtopic.__v": 0,
                "subject._id": 0,
                "subject.__v": 0,
                "country._id": 0,
                "country.__v": 0,
                "country.isDisabled": 0,
                "classes._id": 0,
                "classes.__v": 0,
                "classes.countryCode": 0,
            }
        }
    ])
    res.json(questions);
}));

// TODO: Add Randomness for Large Question Base
router.post('/start'
    , JWT,
    asyncHandler(async (req, res) => {
        let {
            subjects,
            subtopics,
            difficulties,
            endTime,
            startTime
        } = req.body;
        const sessionId = uuid.v4();
        endTime = parseInt(endTime);
        if (isNaN(endTime))
            return reqError(res, 'Invalid End Time');
        endTime = Date.now() + ((endTime === 0) ? (8 * 60 * 60 * 1000) : endTime * 60 * 1000);
        const data = {
            id: req.user._id,
            endTime,
            startTime,
            sessionId,
            exp: Math.floor(endTime / 1000)
        }

        const findUsing = {
            $and: [],
        }
        try {
            if ((subjects || []).length > 0) {
                findUsing.$and.push({
                    $or: subjects.map(ele => ({ subjectID: new ObjectId(ele) }))
                });
            }

            if ((subtopics || []).length > 0) {
                findUsing.$and.push({
                    $or: subtopics.map(ele => ({ subtopicID: new ObjectId(ele) }))
                });
            }

            if (findUsing.$and.length <= 0) {
                return reqError(res, 'No Parameters to Find Questions');
            }

            if ((subtopics || []).length > 0) {
                findUsing.$and.push({
                    $or: difficulties.map(ele => ({ difficultID: new ObjectId(ele) }))
                });
            }

            findUsing.$and.push({
                classID: new ObjectId(req.user.classID),
            });

            findUsing.$and.push({
                countryID: new ObjectId(req.user.countryID),
            });
        } catch (e) {
            return reqError(res, 'Invalid Input Data');
        }
        // TODO: modify for large Database
        const allQues = await QuestionSchema.find(findUsing).count().exec();
        if (allQues <= 0) {
            return reqError(res, 'No Questions for Particular Subject or topic');
        }

        const skip = Math.floor((allQues - 10) * Math.random());
        const limit = 10;

        const allQuestions = randomShuffle(
            await QuestionSchema.find(findUsing, {
                _id: 1
            })
                .skip((skip > 0 ? skip : 0))
                .limit(limit).exec()
        );
        if (allQuestions.length <= 0) {
            return reqError(res, 'No Questions for Particular Subject or topic');
        }

        const question = await QuestionSchema.findById(allQuestions[0]._id, {
            title: 1,
            formatID: 1,
            bodyImage: 1,
            description: 1,
            // hintAudio: 1,
            // hintVideo: 1,
            // rubricAudio: 1,
            data: 1,
        });

        if (question) {
            (new QuestionLog({
                userID: req.user._id,
                sessionId,
                type: 'START',
                info: {
                    findUsing,
                    allQuestions
                },
                questionID: question._id,
                userTime: startTime,
                serverTime: Date.now(),
                endTime: endTime ?? null
            })).save();
        }
        const token = jsonToken.sign(data, 'QUIZ' + process.env.SECRET);
        res.json({
            token,
            total: limit,
            question
        });
    })
);

router.post('/submit', QuestionSession, async (req, res) => {
    let {
        ans,
        format,
        id,
        time
    } = req.body;

    id = new ObjectId(id);
    format = new ObjectId(format);

    const question = await QuestionSchema.findOne({
        _id: id,
        formatID: format
    }).exec();

    if (!question) {
        return reqError(res, 'Question Submitted Doesn\'t Exists.');
    }

    let ansCorrect = checkAnswer(ans, question);
    // try {
    //     assert.deepEqual(question.answer, ans);
    // } catch (e) {
    //     ansCorrect = false;
    // }

    const log = await QuestionLog.findOne({
        userID: req.quesSession.id,
        sessionId: req.quesSession.sessionId,
        type: 'START',
    }, {
        'info.allQuestions': 1
    }).exec();

    if (!log)
        return reqError(res, 'Invalid Session');

    let currentIndex = -1;
    const allQuestions = (log?.info?.allQuestions || []);
    allQuestions.forEach((ques, i) => {
        if (`${ques._id}` === `${id}`)
            currentIndex = i;
    });

    let nextQuestion = null;

    if (currentIndex > -1 && currentIndex < allQuestions.length) {
        nextQuestion = await QuestionSchema.findById(allQuestions[currentIndex + 1], {
            title: 1,
            formatID: 1,
            bodyImage: 1,
            description: 1,
            // hintAudio: 1,
            // hintVideo: 1,
            // rubricAudio: 1,
            data: 1,
        }).exec();
    }


    if (nextQuestion) {
        (new QuestionLog({
            userID: req.quesSession.id,
            sessionId: req.quesSession.sessionId,
            type: 'SUBMIT',
            info: {
                quesId: id,
                ansCorrect
            },
            questionID: nextQuestion._id,
            userTime: time,
            serverTime: Date.now(),
        })).save();
    }

    // TODO: Find Solution Based on Membership.
    res.json({
        ansCorrect,
        question: nextQuestion,
        isLast: (currentIndex >= allQuestions.length),
        solution: 'Unit Conversion can be solved using Multiplication / Division'
    });
});

router.post('/prev', QuestionSession, async (req, res) => {
    let {
        id,
        time
    } = req.body;

    id = new ObjectId(id);

    const log = await QuestionLog.findOne({
        userID: req.quesSession.id,
        sessionId: req.quesSession.sessionId,
        type: 'START',
    }, {
        'info.allQuestions': 1
    }).exec();

    if (!log)
        return reqError(res, 'Invalid Session');

    let currentIndex = -1;
    const allQuestions = (log?.info?.allQuestions || []);
    allQuestions.forEach((ques, i) => {
        if (`${ques._id}` === `${id}`)
            currentIndex = i;
    });

    let prevQuestion = null;

    if (currentIndex > 0 && currentIndex <= allQuestions.length) {
        prevQuestion = await QuestionSchema.findById(allQuestions[currentIndex - 1], {
            title: 1,
            formatID: 1,
            bodyImage: 1,
            description: 1,
            // hintAudio: 1,
            // hintVideo: 1,
            // rubricAudio: 1,
            data: 1,
        }).exec();
    }


    if (prevQuestion) {
        (new QuestionLog({
            userID: req.quesSession.id,
            sessionId: req.quesSession.sessionId,
            type: 'PREV',
            info: {},
            questionID: prevQuestion._id,
            userTime: time,
            serverTime: Date.now(),
        })).save();
    }

    res.json({
        question: prevQuestion,
        isStart: (currentIndex === 1),
    });
});

router.post('/', (req, res) => {
    const { countryId, classId, subjectId, difficultId, skillId, length } = req.body;
    const CountryId = mongoose.Types.ObjectId(countryId)
    const ClassId = mongoose.Types.ObjectId(classId)
    const SubjectId = mongoose.Types.ObjectId(subjectId)

    if (difficultId !== "" && skillId !== "") {
        const dId = mongoose.Types.ObjectId(difficultId);
        const sId = mongoose.Types.ObjectId(skillId);
        var match = {
            $match: {
                countryID: {
                    $in: [CountryId],
                },
                classID: {
                    $in: [ClassId],
                },
                subjectID: SubjectId,
                difficultID: dId,
                skillID: sId,
            },
        };
    } else if (skillId === "" && difficultId !== "") {
        const dId = mongoose.Types.ObjectId(difficultId);
        var match = {
            $match: {
                countryID: {
                    $in: [CountryId],
                },
                classID: {
                    $in: [ClassId],
                },
                subjectID: SubjectId,
                difficultID: dId,
            },
        };
    } else if (skillId != "" && difficultId === "") {
        const sId = mongoose.Types.ObjectId(skillId);
        var match = {
            $match: {
                countryID: {
                    $in: [CountryId],
                },
                classID: {
                    $in: [ClassId],
                },
                subjectID: SubjectId,
                skillID: sId,
            },
        };
    } else {
        var match = {
            $match: {
                countryID: {
                    $in: [CountryId],
                },
                classID: {
                    $in: [ClassId],
                },
                subjectID: SubjectId,
            },
        };
    }
    QuestionSchema.aggregate([
        match, {
            '$lookup': {
                'from': 'questionformats',
                'localField': 'formatID',
                'foreignField': '_id',
                'as': 'string'
            }
        }, {
            '$unwind': {
                'path': '$string'
            }
        },
        {
            '$skip': length
        }, {
            '$limit': 30
        }
    ]).exec()
        .then((result) => {
            if (result.length > 0) {
                var loadStatus = true
            } else {
                var loadStatus = false
            }
            res.status(201).json({
                result: result,
                loadStatus: loadStatus,
                msg: "",
                msgType: "",
            });
        })
        .catch((err) => {
            res.json({
                error: err,
                msg: "Question Fetch error...",
                msgType: "danger",
            });
        });

})


module.exports = router;