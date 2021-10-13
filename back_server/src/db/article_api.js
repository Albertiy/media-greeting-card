const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Music = require('../model/music')
const Bgimage = require('../model/bgimage')
const Product = require('../model/product')
const ArticleTemplate = require('../model/article_template')
const Article = require('../model/article')

const getProductListSql = 'select * from product';
const getArticleTemplateListSql = 'select * from article_template';
const getArticleByCodeIdSql = 'select * from article where code_id = ?';
const addArticleSql = 'insert into article(code_id, template_id, skeleton) values(?,?,convert(?, json))';

const orderStr = ' order by `order` is null, `order` asc';




/**
 * 获取产品列表
 * @returns {Product[]}
 */
function getProductList() {
    let query = getProductListSql;
    let data = [];
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
 * 获取文章模板列表
 * @returns {ArticleTemplate[]}
 */
function getArticleTemplateList() {
    let query = getArticleTemplateListSql;
    query += orderStr;
    let data = [];
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
 * 根据二维码记录id获取文章id
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

module.exports = {
    getProductList,
    getArticleTemplateList,
    getArticleByCodeId,
    addArticle,
}