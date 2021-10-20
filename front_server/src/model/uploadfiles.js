export default class Uploadfiles {
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
    modify_pwd;
    access_pwd;
    needAccessPwd;

    /**
     * 数据库 uploadfiles 表
     * @param {number} id 
     * @param {string} uuid 
     * @param {string} record_id
     * @param {number} product_id
     * @param {string} text_from
     * @param {string} text_to
     * @param {string} text_detail
     * @param {string} videoPath 
     * @param {string} audioPath 
     * @param {boolean} isLocked 
     * @param {boolean} isDeleted 
     * @param {boolean} modify_pwd
     * @param {boolean} access_pwd
     */
    constructor(id, uuid, record_id, product_id, text_from, text_to, text_detail, videoPath, audioPath, isLocked, isDeleted, modify_pwd, access_pwd) {
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
        this.modify_pwd = modify_pwd;
        this.access_pwd = access_pwd;
        if (this.access_pwd) this.needAccessPwd = true;
    }
}

module.exports = Uploadfiles;