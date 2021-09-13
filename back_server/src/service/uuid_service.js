const { v1: uuidV1 } = require('uuid');

const MAX_GEN = 5000;
const MIN_GEN = 1;


/**
 * 批量生成uuid
 * @param {number} count default:1
 * @returns 
 */
function getBatchUUID(count = MIN_GEN) {
    count = count > MAX_GEN ? MAX_GEN : count;
    count = count < MIN_GEN ? MIN_GEN : count;
    let i = 0;
    let batch = [];
    for (i; i < count; i++) {
        batch.push(uuidV1());
    }
    return batch;
}

module.exports = {
    getBatchUUID,
}