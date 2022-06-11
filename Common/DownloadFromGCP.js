const isWin = process.platform === "win32";
const { Storage } = require('@google-cloud/storage');
const fs = require("fs");
const path = require('path');

/**
 * Download File From Private Bucket.
 * @param {String} key File Key (Location of File With Respect to the Bucket.)
 * @returns {String} Destination Location.
 */
async function downloadPrivateFile(key) {
    const storage = new Storage({
        projectId: 'superc',
        keyFilename: 'config/superc-6d7bc3b60061.json',
    });
    let destination = "/tmp/" + key;
    if (isWin) {
        const TEMP = path.join(__filename, "../../TEMP");
        if (!fs.existsSync(TEMP)) {
            fs.mkdirSync(TEMP);
        }
        destination = TEMP + "/" + key;
    }
    const downloadOptions = {
        destination
    };
    try {
        await storage
            .bucket('superc-private-data')
            .file(key)
            .download(downloadOptions);
        return destination;
    }
    catch (err) {
        console.error(err)
        return ""
    }
}

module.exports = { downloadPrivateFile };