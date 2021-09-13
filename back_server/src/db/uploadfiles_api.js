const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const addMultipleSql = 'insert into uploadfiles(uuid) values ?';

/**
 * 新增多条数据
 * @param {string[]} codes 
 * @returns 
 */
function addMultiple(codes) {
    let values = [];
    codes.forEach(element => {
        values.push([element]);
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