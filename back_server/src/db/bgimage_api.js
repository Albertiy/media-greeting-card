const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Bgimage = require('../model/bgimage')

const getListSql = 'select * from bgimage';
const getByIdSql = 'select * from bgimage where id = ?';

const orderStr = ' order by `order` is null, `order` asc';

/**
 * 获取内置背景图片列表
 * @param {number} [product_id]
 * @returns {Bgimage[]}
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


function getById(id) {
    let query = getByIdSql;
    let data = [id];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else if (res.length > 0) {
                resolve(res[0])
            } else {
                reject('未找到对应图片')
            }
        })
    })

}

module.exports = {
    getList: getList,
    getById: getById,
}