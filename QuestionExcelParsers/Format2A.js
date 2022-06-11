const {
    getDifficulty,
    getSubjects,
    getClasses,
    getCountries,
    getSkills,
    getCountry,
    getSkill,
    getClass,
    getSubtopics,
    getSubtopic
} = require("./Utilities");

const InvalidFormatError = require('./InvalidFormatError');

// const QuestionFormat = require('../Models/QuestionFormat');
const QuestionSchema = require('../Models/Question');


const Excel = require('exceljs');
const mongoose = require('mongoose');
const formatID = new mongoose.Types.ObjectId('6293b3d8c494331a7e5103fe');

async function parseFormat2A(filepath, options = {}) {
    let dif = {};
    if (!options?.difficulty) {
        dif = await getDifficulty();
    }

    let subs = {};
    if (!options?.subject) {
        subs = await getSubjects();
    }

    let classes = {};
    if (!options?.class) {
        classes = await getClasses();
    }

    const countries = await getCountries();

    let skills = {};
    if (!options?.skill) {
        skills = await getSkills();
    }

    const topics = await getSubtopics();

    const workbook = new Excel.Workbook();
    // Read File.
    await workbook.xlsx.readFile(filepath);

    const worksheet = workbook.worksheets[0];
    const overall = [];
    worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber === 1) {
            // TODO: Validate Name.
        }
        else if (rowNumber > 1) {
            // Validations
            const value = row.values;
            const errPrefix = `Error AT -> Row ${rowNumber}: `;
            // Validate Serial Number.
            if (!value[1] || isNaN(parseInt(value[1])))
                throw new InvalidFormatError(`${errPrefix} Column 1 Should be Serial Starting with 1. Invalid '${value[1]}'`);

            if (!options.age && !options.class) {
                if (!value[3] || isNaN(parseInt(value[3])))
                    throw new InvalidFormatError(`${errPrefix}Age Should be a Number. Invalid '${value[3]}'`);
            }

            if (!options.subject) {
                if (!value[5] || !(value[5].toLowerCase() in subs))
                    throw new InvalidFormatError(`${errPrefix}Invalid Subject '${value[5]}' Please Define Proper Subject`);
            }

            if (!options.difficulty) {
                if (!value[8] || !(value[8].toLowerCase() in dif))
                    throw new InvalidFormatError(`${errPrefix}Invalid Difficulty '${value[8]}' Please Define Proper Difficulty`);
            }

            if (!value[9])
                throw new InvalidFormatError(`${errPrefix}Question not found '${value[9]}'`);

            if (!value[10])
                throw new InvalidFormatError(`${errPrefix}From not found '${value[10]}'`);

            if (!value[11])
                throw new InvalidFormatError(`${errPrefix}From unit not found '${value[11]}'`);

            if (!value[13])
                throw new InvalidFormatError(`${errPrefix}To 1 unit not found '${value[13]}'`);

            if (!value[15])
                throw new InvalidFormatError(`${errPrefix}To 2 unit not found '${value[15]}'`);

            if (!value[16])
                throw new InvalidFormatError(`${errPrefix}Answer not found '${value[16]}'`);



            const subjectID = (options.subject) ? options.subject : (subs[`${value[5] || ''}`.toLowerCase()]);
            const skillID = (options.skill) ? options.skill : getSkill(value[6], subjectID, skills);
            const countryArray = ((options.country && options.country.length > 0) ? options.country : (value[2] || '').split('/'));
            let classID = options.class;
            if (!options.age && !options.class) {
                classID = getClass(value[4], classes);
            }

            if (!classID) {
                classID = getClassByAge(value[3], classes);
            }
            const answer = value[16].split(",")
            overall.push({
                serial: `${value[1]}`,
                countryID: countryArray.map(ele => getCountry(ele, countries)),
                classID,
                subjectID,
                skillID,
                subtopicID: getSubtopic(value[7], `${skillID}`, topics),
                difficultID: options.difficulty ? options.difficulty : dif[`${value[8] || ''}`.toLowerCase()],
                title: `${value[9] || ''}`,
                data: {
                    from: value[10] ?? null,
                    fromUnit: value[11],
                    to1: value[12] ?? null,
                    to1Unit: value[13],
                    to2: value[14] ?? null,
                    to2Unit: value[15]
                },
                answer: answer,
                hintAudio: `${value[17] ?? ''}`,
                hintVideo: `${value[18] ?? ''}`,
                rubricAudio: `${value[19] ?? ''}`,
                formatID,
                category: options?.category || "PRACTICE"
            })
        }
    });
    QuestionSchema.insertMany(overall);
    // console.log(overall)
}

module.exports = parseFormat2A;
