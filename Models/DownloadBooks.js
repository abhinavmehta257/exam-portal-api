const mongoose = require('mongoose');
const Class = require('./Class');
const Country = require('./Country');
const DownloadExam = require('./DownloadExam');
const DownloadSubject = require('./DownloadSubject');
const DownloadTypes = require('./DownloadTypes');

const PriceSchema = mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        ref: Country.collection.name,
        required: true,
        index: true
    },
    name: String,
    code: String,
    price: Number,
    pricePrefix: String,
});

const DownloadBook = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    popularity: { type: Number, required: true, default: false },
    author: { type: String, required: false },
    publish_date: { type: Date, required: true },
    file: { type: String, required: false },
    free_file: { type: String, required: false },
    price: [{
        type: PriceSchema,
        // required: true
    }],
    countries: [{
        type: mongoose.Types.ObjectId,
        ref: Country.collection.name,
        // required: true,
        index: true
    }],
    subjects: [{
        type: mongoose.Types.ObjectId,
        ref: DownloadSubject.collection.name,
        required: true,
        index: true
    }],
    exams: [{
        type: mongoose.Types.ObjectId,
        ref: DownloadExam.collection.name,
        // required: true,
        index: true
    }],
    classID: [{
        type: mongoose.Types.ObjectId,
        ref: Class.collection.name,
        required: false,
        index: true
    }],
    types: [{
        type: mongoose.Types.ObjectId,
        ref: DownloadTypes.collection.name,
        // required: true,
        index: true
    }],
});

module.exports = mongoose.model('download_books', DownloadBook);
