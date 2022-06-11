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
const formatID = new mongoose.Types.ObjectId('61bace9584476677d477e76c');

async function parseFormat2(filepath, options = {}) {
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

            if (!value[14])
                throw new InvalidFormatError(`${errPrefix}Answer not found '${value[14]}'`);

            if (!value[10] && !value[12]) {
                throw new InvalidFormatError(`${errPrefix}LHS and RHS Together Can't be Empty`);
            }

            if (!value[11]) {
                throw new InvalidFormatError(`${errPrefix}LHS Unit Can't be Empty`);
            }

            if (!value[13]) {
                throw new InvalidFormatError(`${errPrefix}RHS Unit Can't be Empty`);
            }

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
                    lhs: value[10] ?? null,
                    lhsUnit: value[11],
                    rhs: value[12] ?? null,
                    rhsUnit: value[13]
                },
                answer: `${value[14] ?? ''}`,
                hintAudio: `${value[15] ?? ''}`,
                hintVideo: `${value[16] ?? ''}`,
                rubricAudio: `${value[17] ?? ''}`,
                formatID,
                category: options?.category || "PRACTICE"
            })
        }
    });
    QuestionSchema.insertMany(overall);
    // console.log(overall)
}

module.exports = parseFormat2;

// workbook.eachSheet(function (worksheet, sheetId) {
//     // console.log(worksheet);
//     console.log(sheetId);
// });
// worksheet.getRows()
// worksheet.columns[0].eachCell((cell, rowNumber) => console.log(cell))
// console.log();
