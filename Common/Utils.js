const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

function randomShuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const { Types } = require('mongoose');

function toObjectId(x) {
    return new Types.ObjectId(x);
}

function toObjectIdArray(x, key = '') {
    if (key) {
        return x.map(ele => ({ [key]: toObjectId(ele) }));
    }
    return x.map(ele => toObjectId(ele));
}


module.exports = {
    validateEmail,
    randomShuffle,
    toObjectId,
    toObjectIdArray
}