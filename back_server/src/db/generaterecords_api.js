const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();

const addSql = 'insert into generaterecords(count, first, latest, filePath) values (?,?,?,?)';

/**
 * 
 * @param {number} count 
 * @param {string} first 第一个code
 * @param {string} latest 最后一个code
 * @param {string} filePath 文件生成/保存路径
 * @returns 
 */
function add(count, first, latest, filePath) {
    let values = [count, first, latest, filePath];
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

}

module.exports = {
    add,
}