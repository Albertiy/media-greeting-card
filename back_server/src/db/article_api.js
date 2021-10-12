const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Music = require('../model/music')
const Bgimage = require('../model/bgimage')
const Product = require('../model/product')
const ArticleTemplate = require('../model/article_template')
const Article = require('../model/article')
const getMusicListSql = 'select * from music'; // select * from music where product_id = ? order by `order` is null, `order`asc;
const getBgImageListSql = 'select * from bgimage';
const getProductListSql = 'select * from product';
const getArticleTemplateListSql = 'select * from article_template';
const getArticleByCodeIdSql = 'select * from article where code_id = ?';
const addArticleSql = 'insert into article(code_id, template_id, skeleton) values(?,?,convert(?, json))';

const orderStr = ' order by `order` is null, `order` asc';


/**
 * 获取音乐列表
 * @param {number} [product_id]
 * @returns {Music[]}
 */
function getMusicList(product_id) {
    let query = getMusicListSql;
    let data = [];
    if (product_id) { query += ' where product_id = ? '; data.push(product_id); }
    query += orderStr;
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
 * 获取内置背景图片列表
 * @param {number} [product_id]
 * @returns {Bgimage[]}
 */
function getBgImageList(product_id) {
    let query = getBgImageListSql;
    let data = [];
    if (product_id) { query += ' where product_id = ? '; data.push(product_id); }
    query += orderStr;
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
    getMusicList,
    getBgImageList,
    getProductList,
    getArticleTemplateList,
    getArticleByCodeId,
    addArticle,
}