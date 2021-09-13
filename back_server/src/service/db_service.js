const UploadfilesAPI = require('../db/uploadfiles_api');
const GeneraterecordsAPI = require('../db/generaterecords_api');

function insertCodes(codes) {
    return new Promise((resolve, reject) => {
        UploadfilesAPI.addMultiple(codes).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

function insertGenerateRecord(count, first, latest, filePath) {
    return new Promise((resolve, reject) => {
        GeneraterecordsAPI.add(count, first, latest, filePath).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })

}

module.exports = {
    insertCodes,
}