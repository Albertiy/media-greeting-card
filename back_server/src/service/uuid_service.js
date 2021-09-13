const { v4: uuidv4 } = require('uuid');

const MAX_GEN = 5000;


/**
 * 批量生成uuid
 * @param {number} count default:1
 * @returns 
 */
function getBatchUUID(count = 1) {
    let i = 0;
    let batch = [];
    for (i; i < count; i++) {
        batch.push(uuidv4());
    }
    return batch;
}

module.exports = {
    getBatchUUID,
}