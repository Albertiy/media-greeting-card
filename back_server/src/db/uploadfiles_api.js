const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const addMultipleSql = 'insert into uploadfiles(uuid, record_id) values ?';
const setLockSql = 'update uploadfiles set isLocked = ? where id = ?';
const getByCodeSql = 'SELECT * FROM heka.uploadfiles where uuid = ?';
const updateTextSql = 'update heka.`uploadfiles` set `text_from`=?, `text_to`=? where `uuid` = ?';
const updateFileSql = 'update heka.`uploadfiles` set '; // where `uuid` = ?

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
 * @param {number} id //where `uuid` = ?
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


/**
 * 根据code（uuid）查询
 * @param {string} code 即 uuid
 */
function getByCode(code) {
    return new Promise((resolve, reject) => {
        pool.query(getByCodeSql, [code], (err, res, fields) => {
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
 * 
 * @param {string} code 
 * @param {string} textFrom 
 * @param {string} textTo 
 * @returns 
 */
function updateText(code, textFrom, textTo) {
    return new Promise((resolve, reject) => {
        pool.query(updateTextSql, [textFrom, textTo, code], (err, res, fields) => {
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
 * 
 * @param {string} code 
 * @param {string} videoPath 
 * @param {string} audioPath 
 * @returns 
 */
function updateFile(code, videoPath, audioPath) {
    let data = [];
    let query = updateFileSql;
    if (videoPath) { query += ' videoPath = ? '; data.push(videoPath) }
    if (audioPath) { if (videoPath && audioPath) query += ' , '; query += ' audioPath = ? '; data.push(audioPath) }
    query += 'where `uuid` = ?';
    data.push(code);
    // console.log('query: %o', query)
    // console.log('data: %o', data)
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
    addMultiple,
    setLock,
    getByCode,
    updateText,
    updateFile,
}