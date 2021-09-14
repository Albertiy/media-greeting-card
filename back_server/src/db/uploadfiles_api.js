const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const addMultipleSql = 'insert into uploadfiles(uuid, record_id) values ?';
const setLockSql = 'update uploadfiles set isLocked = ? where id = ?';

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

/**
 * 更新锁定状态
 * @param {number} id 
 * @param {boolean} lock 
 * @returns 
 */
function setLock(id, lock) {
    return new Promise((resolve, reject) => {
        pool.query(setLockSql, [lock, id], (err, res, fields) => {
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
    setLock,
}