const UploadfilesAPI = require('../db/uploadfiles_api');
const GeneraterecordsAPI = require('../db/generaterecords_api');

/**
 * 合并批量插入二维码与插入生成记录服务
 * @param {string[]} codes 
 * @param {string} zipFilePath 
 * @returns 
 */
function insertCodesAndRecord(codes, zipFilePath) {
    return new Promise((resolve, reject) => {
        if (codes && codes.length > 0) {
            let count = codes.length;
            let first = codes[0];
            let latest = codes[codes.length - 1];
            let promList = [];
            promList.push(UploadfilesAPI.addMultiple(codes).then((result) => {
                console.log('[insertCodes] result: %o', result)
            }).catch((err) => {
                reject(err)
            }));
            promList.push(GeneraterecordsAPI.add(count, first, latest, zipFilePath).then((result) => {
                console.log('[insertGenerateRecord] result: %o', result)
            }).catch((err) => {
                reject(err)
            }));
            Promise.all(promList).then((result) => {
                resolve(true);
            }).catch((err) => {
                reject(err)
            });
        } else {
            reject('生成的二维码为空')
        }
    })

}

/**
 * 批量插入二维码
 * @param {*} codes 
 * @returns 
 */
function insertCodes(codes) {
    return new Promise((resolve, reject) => {
        UploadfilesAPI.addMultiple(codes).then((result) => {
            console.log('[insertCodes] result: %o', result)
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 插入二维码生成记录
 * @param {*} count 
 * @param {*} first 
 * @param {*} latest 
 * @param {*} filePath 
 * @returns 
 */
function insertGenerateRecord(count, first, latest, filePath) {
    return new Promise((resolve, reject) => {
        GeneraterecordsAPI.add(count, first, latest, filePath).then((result) => {
            console.log('[insertGenerateRecord] result: %o', result)
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })

}

module.exports = {
    insertCodes,
    insertGenerateRecord,
    insertCodesAndRecord,
}