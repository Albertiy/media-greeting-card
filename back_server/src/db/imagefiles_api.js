const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const Imagefiles = require('../model/imagefiles')

const getByIdSql = 'select * from imagefiles where id = ?';
const createSql = 'insert into imagefiles(`code_id`, `path`) values(?, ?);';
const updateSql = 'update imagefiles set `path` = ? where `id` = ?;';

const orderStr = ' order by `order` is null, `order` asc';

/**
 * 用Id获取图片
 * @param {number} id 
 * @returns {Promise<Imagefiles>}
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

/**
 * 创建新图片记录
 * @param {number} code_id 
 * @param {string} path 
 */
function create(code_id, path) {
    let query = createSql;
    let data = [code_id, path];
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
 * 更新图片记录
 * @param {number} id 
 * @param {string} path 
 */
function update(id, path) {
    let query = updateSql;
    let data = [path, id];
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
    getById: getById,
    create: create,
    update: update,
}