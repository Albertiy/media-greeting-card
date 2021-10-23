const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Imagefiles = require('../model/imagefiles')

const getByIdSql = 'select * from imagefiles where id = ?';

const orderStr = ' order by `order` is null, `order` asc';

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
            if (err) {
                console.log(err)
                reject(err)
            } else if (res.length > 0) {
                resolve(res[0])
            } else {
                reject('No Image File Found')
            }
        })
    })

}

module.exports = {
    getById: getById,
}