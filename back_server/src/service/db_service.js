const UploadfilesAPI = require('../db/uploadfiles_api');
const GeneraterecordsAPI = require('../db/generaterecords_api');
const Uploadfiles = require('../model/uploadfiles');

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
            GeneraterecordsAPI.add(count, first, latest, zipFilePath).then((result) => {
                let recordId = result.insertId;
                console.log('[insertGenerateRecord] result: %o', result)
                UploadfilesAPI.addMultiple(codes, recordId).then((result) => {
                    console.log('[insertCodes] result: %o', result)
                    resolve(true);
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => {
                reject(err)
            })
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

/**
 * 通过id或时间获取记录数组
 * @param {{id: number, startTime: string, endTime: string}} params 
 * @returns 
 */
function getRecords(params) {
    let { id, startTime, endTime } = params;
    console.log('params: %o', params);
    return new Promise((resolve, reject) => {
        if (id) {
            GeneraterecordsAPI.get(id).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        } else // if (startTime && endTime) {
        {
            GeneraterecordsAPI.getByTime(startTime, endTime).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        }
    })
}

/**
 * 设置上锁状态
 * @param {number} id 
 * @param {boolean} lock 
 * @returns 
 */
function setLock(id, lock) {
    return new Promise((resolve, reject) => {
        UploadfilesAPI.setLock(id, lock).then((result) => {
            if (result.affectedRows > 0)
                resolve(result)
            else
                reject('无效的id')
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 获取上传信息
 * @param {string} code 页面的上传参数
 * @returns {Promise<Uploadfiles>}
 */
function getUploadInfo(code) {
    return new Promise((resolve, reject) => {
        if (!code) { reject('缺少必要参数'); return; }
        UploadfilesAPI.getByCode(code).then((result) => {
            if (result && result.length > 0)
                resolve(result[0])
            else
                reject('无效的code')
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 更新祝福文字相关内容
 * @param {{code:string, textFrom:string, textTo:string}} params 
 */
function updateGreetingText(params) {
    return new Promise((resolve, reject) => {
        let { code, textFrom, textTo } = params;
        if (!code) { reject('缺少必要参数'); return; }
        UploadfilesAPI.updateText(code, textFrom, textTo).then((result) => {
            if (result.affectedRows > 0)
                resolve('成功上传文本')
            else
                reject('无效的code')
        }).catch((err) => {
            reject(err)
        });
    })
}

module.exports = {
    insertCodes,
    insertGenerateRecord,
    insertCodesAndRecord,
    getRecords,
    setLock,
    getUploadInfo,
    updateGreetingText,
}