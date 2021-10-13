const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Product = require('../model/product')

const getProductListSql = 'select * from product';

/**
 * 获取产品列表
 * @returns {Product[]}
 */
function getList() {
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
    getList: getList,
}