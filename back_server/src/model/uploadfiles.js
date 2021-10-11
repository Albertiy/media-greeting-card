class Uploadfiles {
    id;
    uuid;
    record_id;
    product_id;
    text_from;
    text_to;
    text_detail;
    videoPath;
    audioPath;
    isLocked;
    isDeleted;

    /**
     * 数据库 uploadfiles 表，Code唯一表，兼音视频数据表
     * @param {number} id 
     * @param {string} uuid 
     * @param {number} record_id
     * @param {number} product_id
     * @param {string} text_from
     * @param {string} text_to
     * @param {string} text_detail
     * @param {string} videoPath 
     * @param {string} audioPath 
     * @param {boolean} isLocked 
     * @param {boolean} isDeleted 
     */
    constructor(id, uuid, record_id, product_id, text_from, text_to, text_detail, videoPath, audioPath, isLocked, isDeleted) {
        this.id = id;
        this.uuid = uuid;
        this.record_id = record_id;
        this.product_id = product_id;
        this.text_from = text_from;
        this.text_to = text_to;
        this.text_detail = text_detail;
        this.videoPath = videoPath;
        this.audioPath = audioPath;
        this.isLocked = isLocked;
        this.isDeleted = isDeleted;
    }
}

module.exports = Uploadfiles;