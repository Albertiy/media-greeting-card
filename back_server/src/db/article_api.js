const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Article = require('../model/article')

const getArticleByCodeIdSql = 'select * from article where code_id = ?';
const getArticleByCodeSql = 'select t1.* from article as t1 inner join uploadfiles as t2 where t1.code_id = t2.id and t2.`uuid` = ?;';
const addArticleSql = 'insert into article(code_id, template_id, skeleton) values(?,?,convert(?, json))';
const updateTextSql = 'update article as t1 inner join uploadfiles as t2 on t1.code_id = t2.id set t1.skeleton = json_set(t1.skeleton,"$.title",?,"$.textList[0]",?) where t2.`uuid` = ?;';
const updateImageSql = 'update article as t1 inner join uploadfiles as t2 on t1.code_id = t2.id set t1.skeleton = json_set(t1.skeleton,"$.imageList[?]",?) where t2.`uuid` = ?;';

const orderStr = ' order by `order` is null, `order` asc';



/**
 * 根据二维码记录id获取文章
 * @param {number} codeid 关联二维码记录的id
 * @returns {Article[]}
 */
function getArticleByCodeId(codeid) {
    let query = getArticleByCodeIdSql;
    let data = [codeid];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })

}

/**
 * 根据二维码uuid获取文章
 * @param {string} code 二维码uuid
 */
function getArticleByCode(code) {
    let query = getArticleByCodeSql;
    let data = [code];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

function addArticle(code_id, template_id, skeleton) {
    let query = addArticleSql;
    let data = [code_id, template_id, JSON.stringify(skeleton)];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
                if (err.errno == 1452) {
                    reject('code_id不存在，无法创建Article')
                } else {
                    reject(err)
                }
            } else {
                resolve(res)
            }
        })
    })

}

function updateText(code, title, content) {
    let query = updateTextSql;
    let data = [title, content, code];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
            } else {
                resolve(res)
            }
        })
    })

}

function updateImage(code, imageId, imageIdx = 0) {
    let query = updateImageSql;
    let data = [imageIdx, imageId, code];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
            } else {
                resolve(res)
            }
        })
    })
}

module.exports = {
    getArticleByCodeId,
    getArticleByCode,
    addArticle,
    updateText,
    updateImage,
}