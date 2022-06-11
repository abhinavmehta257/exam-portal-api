const CountrySchema = require('../Models/Country');
const ClassSchema = require('../Models/Class');
const DifficultySchema = require('../Models/Difficulty');
const SubjectSchema = require('../Models/Subject');
const SkillSchema = require('../Models/Skill');
const SubtopicSchema = require('../Models/Subtopic');
const InvalidFormatError = require('./InvalidFormatError');

async function arrayToDict(Schema) {
    const difDB = await Schema.find().exec();
    const difficulty = {};
    difDB.forEach(ele => difficulty[ele.title.toLowerCase()] = ele._id);
    return difficulty;
}

async function getDifficulty() {
    return await arrayToDict(DifficultySchema);
}

async function getSubjects() {
    return await arrayToDict(SubjectSchema);
}

async function getClasses() {
    const difDB = await ClassSchema.find().exec();
    const difficulty = {};
    difDB.forEach(ele => {
        difficulty[ele.title.trim().toLowerCase()] = ele._id;
    });
    return difficulty;
}

function getClass(classNumber, classes = {}) {
    const _class = parseInt(classNumber);
    if (isNaN(_class) || _class < 1 || _class > 12)
        return null;
    return classes[`class ${_class}`];
}

function getClassByAge(age, classes = {}) {
    const _class = parseInt(age);
    if (isNaN(_class) || _class < 1 || _class > 12)
        return null;
    return classes[`year ${_class}`];
}


async function getCountries() {
    const difDB = await CountrySchema.find({
        isDisabled: false
    }).exec();
    const difficulty = {};
    difDB.forEach(ele => {
        difficulty[ele.code.toLowerCase()] = ele._id;
    });
    return difficulty;
}

async function getSkills() {
    const difDB = await SkillSchema.find().exec();
    const difficulty = {};
    difDB.forEach(ele => {
        if (!(ele.subjectID in difficulty)) {
            difficulty[ele.subjectID] = {};
        }
        difficulty[ele.subjectID][ele.title.toLowerCase()] = ele._id;
    });
    return difficulty;
}


function getCountry(country, countries = {}) {
    const NotModified = country;
    country = (country || '').toLowerCase().replace(/ +/g, '');
    if (country === 'uk') country = 'gb';
    if (country in countries)
        return countries[country];
    else
        throw new InvalidFormatError(`Country Not Found '${NotModified}' Please use country code!`);
}

function getSkill(skill, subjectId, skills = {}) {
    const _skill = skill.toLowerCase().trim();
    if (!subjectId)
        throw new InvalidFormatError(`Subject Not Found '${subjectId}'`);
    if (!(subjectId in skills) || !(_skill in skills[subjectId])) {
        throw new InvalidFormatError(`Skill Not Found '${skill}'`);
    }
    return skills[subjectId][_skill];
}

async function getSubtopics() {
    const difDB = await SubtopicSchema.find().exec();
    const topics = {};
    difDB.forEach(ele => {
        if (!(ele.skillID in topics)) {
            topics[ele.skillID] = {};
        }
        topics[ele.skillID][ele.title.toLowerCase()] = ele._id;
    });
    return topics;
}

function getSubtopic(topic, skillID, topics = {}) {
    const _topic = (topic || '').toLowerCase().trim();
    if (skillID in topics)
        if (_topic in topics[skillID])
            return topics[skillID][_topic];
    throw new InvalidFormatError(`Topic Not Found "${topic}"`);
}

function parseToIntArray(value, errPrefix = '') {
    const ints = value.split(",");
    return ints.map(ele => {
        const tmp = parseInt(ele.trim(), 10);
        if (isNaN(tmp))
            throw new InvalidFormatError(`${errPrefix}Invalid Numbers. Please use proper number and Properly Separate using  comma '${value}'`);

        return tmp;
    })
}

function parseEquation(value, errPrefix = '') {
    let underscore = 1, digits = "", i = 0, equalCount = 0;
    const equation = [];
    const nullIndex = [];
    while (i < value.length) {
        // Skip Spaces.
        if (value[i] === ' ') {
            ++i;
            continue;
        }
        // Group Underscores
        while (i < value.length && value[i] === '_') {
            ++i;
            ++underscore;
        }
        if (underscore > 0) {
            nullIndex.push(equation.length);
            equation.push(null);
            underscore = 0;
            continue;
        }
        // Operators.
        if (value[i] === '+' || value[i] === '-' || value[i] === '*' || value[i] === '/' || value[i] === '=') {
            equation.push(value[i]);
            ++i;
            if (value[i] === '=') {
                ++equalCount;
            }
            continue;
        }

        // Digit.
        while (i < value.length && value[i] >= 0 && value[i] <= 9) {
            digits += value[i];
            ++i;
        }
        if (digits) {
            equation.push(parseInt(digits));
            digits = "";
            continue;
        }

        throw new InvalidFormatError(`${errPrefix}Invalid Symbol ${value[i]}`);
    }

    if (equalCount > 1) {
        throw new InvalidFormatError(`${errPrefix}Number of Equal are more than 1 ${value}`);
    }

    return {
        equation,
        variableCount: nullIndex.length,
        variablePos: nullIndex
    }
}

function toSingleAlphabet(value) {
    return value.split('').filter(ele => ele ? true : false);
}

module.exports = {
    arrayToDict,
    getDifficulty,
    getSubjects,
    getClasses,
    getClass,
    getClassByAge,
    getCountries,
    getSkills,
    getCountry,
    getSkill,
    getSubtopics,
    getSubtopic,
    parseToIntArray,
    parseEquation,
    toSingleAlphabet
}