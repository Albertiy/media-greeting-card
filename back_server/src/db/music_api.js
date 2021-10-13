const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Music = require('../model/music')

const getListSql = 'select * from music';
// select * from music where product_id = ? order by `order` is null, `order`asc;
const getByIdSql = 'select * from music where id = ?';

const orderStr = ' order by `order` is null, `order` asc';


/**
 * 获取音乐列表
 * @param {number} [product_id]
 * @returns {Music[]}
 */
function getList(product_id) {
    let query = getListSql;
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
 * 用Id获取音乐
 * @param {number} id 
 * @returns 
 */
function getById(id) {
    let query = getByIdSql;
    let data = [id];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            console.log(res)
            if (err) {
                console.log(err)
                reject(err)
            } else if (res.length > 0) {
                resolve(res[0])
            } else {
                reject('未找到对应音乐')
            }
        })
    })

}

module.exports = {
    getList: getList,
    getById: getById,
}