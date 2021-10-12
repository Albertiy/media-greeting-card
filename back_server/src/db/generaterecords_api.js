const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();

const addSql = 'insert into generaterecords(count, first, latest, filePath, product_id) values (?,?,?,?,?)';
const getSql = 'select * from heka.generaterecords where id = ?';
const getByTimeSql = 'select * from heka.generaterecords';

/**
 * 
 * @param {number} count 
 * @param {string} first 第一个code
 * @param {string} latest 最后一个code
 * @param {string} filePath 文件生成/保存路径
 * @param {string} productId 产品Id
 * @returns 
 */
function add(count, first, latest, filePath, productId = null) {
    try {
        let values = [count, first, latest, filePath, productId];
        return new Promise((resolve, reject) => {
            pool.query(addSql, values, (err, res, fields) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    } catch (e) {
        return new Promise((resolve, reject) => { reject(e) })
    }
}

/**
 * 通过id查询
 * @param {number} id 
 * @returns 
 */
function get(id) {
    try {
        return new Promise((resolve, reject) => {
            pool.query(getSql, [id], (err, res, fields) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    } catch (e) {

    }
}

/**
 * 通过时间段查询
 * @param {string} startTime 
 * @param {string} endTime 
 */
function getByTime(startTime, endTime) {
    let query = getByTimeSql;
    let params = [];
    if (startTime || endTime) {
        query += ' where ';
        if (startTime) { query += 'create_time > ?'; params.push(startTime) }
        if (startTime && endTime) { query += ' and ' }
        if (endTime) { query += 'create_time < ?'; params.push(endTime) }
    }
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err, res, fields) => {
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
    add,
    get,
    getByTime,
}