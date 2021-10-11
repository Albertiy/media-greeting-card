const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Music = require('../model/music')
const Bgimage = require('../model/bgimage')
const Product = require('../model/product')
const getMusicListSql = 'select * from music'; // select * from music where product_id = ? order by `order` is null, `order`asc;
const getBgImageListSql = 'select * from bgimage';
const getProductListSql = 'select * from product';
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
 * 获取泵背景图片列表
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

module.exports = {
    getMusicList,
    getBgImageList,
    getProductList,
}