const multer = require('multer');
const multerGoogleStorage = require("multer-google-storage");
const { v4: uuidv4 } = require('uuid');


// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: function (req, file, callback) {
//         const ind = file.originalname.lastIndexOf('.');
//         const ext = file.originalname.substr(ind);
//         const name = uuidv4() + ext;
//         callback(null, name);
//     }
// });

const storage = multerGoogleStorage.storageEngine({
    filename: function (_, file, callback) {
        const ind = file.originalname.lastIndexOf('.');
        const ext = file.originalname.substr(ind);
        const name = uuidv4() + ext;
        console.log(name);
        callback(null, name);
    },
    keyFilename: 'config/superc-6d7bc3b60061.json',
    projectId: 'superc',
    bucket: 'superc-public-data'
})

module.exports = multer({
    storage,
    onError: function (err, next) {
        console.log('error', err);
        next(err);
    }
});