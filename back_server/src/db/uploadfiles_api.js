const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const addMultipleSql = 'insert into uploadfiles(uuid, record_id) values ?';

/**
 * 新增多条数据
 * @param {string[]} codes  
 * @param {number} recordId 记录id
 * @returns 
 */
function addMultiple(codes, recordId) {
    let values = [];
    codes.forEach(element => {
        values.push([element, recordId]);
    });
    return new Promise((resolve, reject) => {
        pool.query(addMultipleSql, [values], (err, res, fields) => {
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
    addMultiple,
}