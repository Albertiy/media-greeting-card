const UploadfilesAPI = require('../db/uploadfiles_api');
const GeneraterecordsAPI = require('../db/generaterecords_api');
const ArticleAPI = require('../db/article_api');
const ArticleTemplateAPI = require('../db/article_template_api');
const BgImageAPI = require('../db/bgimage_api');
const MusicAPI = require('../db/music_api')
const ProductAPI = require('../db/product_api')
const Uploadfiles = require('../model/uploadfiles');
const SkeletonTemplate = require('../model/skeleton_template');
const Article = require('../model/article');
const BgImage = require('../model/bgimage')

/**
 * 合并批量插入二维码与插入生成记录服务
 * @param {string[]} codes 
 * @param {string} zipFilePath 
 * @param {number} productId
 * @returns 
 */
function insertCodesAndRecord(codes, zipFilePath, productId) {
    return new Promise((resolve, reject) => {
        if (codes && codes.length > 0) {
            let count = codes.length;
            let first = codes[0];
            let latest = codes[codes.length - 1];
            GeneraterecordsAPI.add(count, first, latest, zipFilePath, productId).then((result) => {
                let recordId = result.insertId;
                console.log('[insertGenerateRecord] result: %o', result)
                UploadfilesAPI.addMultiple(codes, recordId, productId).then((result) => {
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
 * @param {string} uuid 
 * @param {boolean} lock 
 * @returns 
 */
function setLock(uuid, lock) {
    return new Promise((resolve, reject) => {
        UploadfilesAPI.setLock(uuid, lock).then((result) => {
            if (result.affectedRows > 0)
                resolve(result)
            else
                reject('无效的code')
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
            if (result && result.length > 0) {
                /** @type {Uploadfiles} */
                let temp = result[0];
                temp.needAccessPwd = !!temp.access_pwd; // 此字段用于前端判断是否需要查看密码
                resolve(temp)
            }

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

/**
 * 
 * @param {{code:string, dbVideoPath:string, dbAudioPath: string}} params 
 * @returns 
 */
function updateGreetingFiles(params) {
    console.log('[updateGreetingFiles] params: %o', params);
    let { code, dbVideoPath: videoPath, dbAudioPath: audioPath } = params;
    return new Promise((resolve, reject) => {
        if (!code || (!videoPath && !audioPath)) { reject('缺少必要参数'); return; }
        UploadfilesAPI.updateFile(code, videoPath, audioPath).then((result) => {
            if (result.affectedRows > 0)
                resolve('成功将文件路径写入数据库')
            else
                reject('无效的code')
        }).catch((err) => {
            reject('无效的code')
        });
    })
}

function getMusicList() {
    return new Promise((resolve, reject) => {
        ArticleAPI.getMusicList().then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

function getBgImageList() {
    return new Promise((resolve, reject) => {
        BgImageAPI.getList().then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

function getProductList() {
    return new Promise((resolve, reject) => {
        ProductAPI.getList().then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

function getArticleTemplateList() {
    return new Promise((resolve, reject) => {
        ArticleTemplateAPI.getArticleTemplateList().then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 
 * @param {number} codeId 
 * @param {number} templateId 
 * @returns {Promise<number>} 新插入数据的id
 */
function createArticle(codeId, templateId) {
    let skeleton = SkeletonTemplate[templateId];
    return new Promise((resolve, reject) => {
        ArticleAPI.addArticle(codeId, templateId, skeleton).then((result) => {
            resolve(result.insertId)
        }).catch((err) => { reject(err) });
    })
}

/**
 * 
 * @param {number} codeId 
 * @returns {Promise<Article>}
 */
function getArticleByCodeId(codeId) {
    return new Promise((resolve, reject) => {
        ArticleAPI.getArticleByCodeId(codeId).then((result) => {
            if (result.length > 0) {
                /** @type{Article} */
                let res = result[0];
                if (res.skeleton) res.skeleton = JSON.parse(res.skeleton);
                if (res.paragraph_set) res.paragraph_set = JSON.parse(res.paragraph_set);
                resolve(res);
            } else reject('未找到此id对应的文章')
        }).catch((err) => {
            reject(err)
        });
    })
}

function getOrCreateArticleByCodeId(codeId) {
    return new Promise((resolve, reject) => {
        getArticleByCodeId(codeId).then((result) => {
            resolve(result);
        }).catch((err) => {
            createArticle(codeId, 1).then((result) => {
                resolve(getArticleByCodeId(codeId))
            }).catch((err) => {
                reject(err)
            });
        });
    })
}

/**
 * 
 * @param {number} id 
 * @returns {Promise<BgImage>}
 */
function getBgImage(id) {
    return BgImageAPI.getById(id);
}

function getMusic(id) {
    return MusicAPI.getById(id);
}

module.exports = {
    insertCodes,
    insertGenerateRecord,
    insertCodesAndRecord,
    getRecords,
    setLock,
    getUploadInfo,
    updateGreetingText,
    updateGreetingFiles,
    getMusicList,
    getMusic,
    getBgImageList,
    getProductList: getProductList,
    getArticleTemplateList,
    getArticleByCodeId,
    createArticle,
    getOrCreateArticleByCodeId,
    getBgImage,
}