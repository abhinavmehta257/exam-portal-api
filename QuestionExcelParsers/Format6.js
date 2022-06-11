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
    getSubtopic,
    toSingleAlphabet
} = require("./Utilities");

const InvalidFormatError = require('./InvalidFormatError');

// const QuestionFormat = require('../Models/QuestionFormat');
const QuestionSchema = require('../Models/Question');


const Excel = require('exceljs');
const mongoose = require('mongoose');
const formatID = new mongoose.Types.ObjectId('61bace9584476677d477e770');

function toSingle(value) {
   let result = value.split(',').map(ele => {
        if (ele.trim() === '___') {
            return null;
        }else {
            return ele.trim();
        }
    });
    return {result, nullCount: result.filter(ele => ele === null).length};
}

async function parseFormat6(filepath, options = {}) {
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

            // Validate Year.
            if (!options.age && !options.class) {
                if (!value[3] || isNaN(parseInt(value[3])))
                    throw new InvalidFormatError(`${errPrefix}Year Should be a Number. Invalid '${value[3]}'`);
            }

            // Subject
            if (!options.subject) {
                if (!value[5] || !(value[5].toLowerCase() in subs))
                    throw new InvalidFormatError(`${errPrefix}Invalid Subject '${value[5]}' Please Define Proper Subject`);
            }

            // Difficulty.
            if (!options.difficulty) {
                if (!value[8] || !(value[8].toLowerCase() in dif))
                    throw new InvalidFormatError(`${errPrefix}Invalid Difficulty '${value[8]}' Please Define Proper Difficulty`);
            }

            if (!value[9])
                throw new InvalidFormatError(`${errPrefix}Question not found '${value[9]}'`);

            // column 1 Value[10]
            const column1 = toSingle(value[10]);
            // column 2 Value[11]
            const column2 = toSingle(value[11]);
            // Operator Value[12]

            // Result Value[13]
            const result = toSingle(value[12]);
            console.log(result);

            //length of all columns should be same.
            if (column1.result.length !== column2.result.length || column1.result.length !== result.result.length)
                throw new InvalidFormatError(`${errPrefix}All Columns Should be of Same Length.`);
            // Answers Value[14]
            const answer = String(value[13]).split(',').map(ele => ele.trim());

            let table =[];

            for (let i = 0; i < column1.result.length; i++) {
                table.push([column1.result[i], column2.result[i],result.result[i]]);
            }   
            console.log(table);
            console.log(column1.nullCount + column2.nullCount + result.nullCount, answer.length);
            if ((column1.nullCount + column2.nullCount + result.nullCount) !== answer.length) {
                throw new InvalidFormatError(`${errPrefix}Answer is Not matching with number of blocks!`);
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
            const boxes = answer.length;
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
                    table,
                    boxes
                },
                answer: answer,
                hintAudio: `${value[15] ?? ''}`,
                hintVideo: `${value[16] ?? ''}`,
                rubricAudio: `${value[17] ?? ''}`,
                formatID,
                category: options?.category || "PRACTICE"
            });
        }
    });
    QuestionSchema.insertMany(overall);
    // console.log(overall)
}

module.exports = parseFormat6;

// workbook.eachSheet(function (worksheet, sheetId) {
//     // console.log(worksheet);
//     console.log(sheetId);
// });
// worksheet.getRows()
// worksheet.columns[0].eachCell((cell, rowNumber) => console.log(cell))
// console.log();
