class Generaterecords {
    id;
    count;
    product_id;
    first;
    latest;
    filePath;
    create_time;

    /**
     * code批次生成记录表
     * @param {number} id 
     * @param {number} count 
     * @param {number} product_id
     * @param {string} first 
     * @param {string} latest 
     * @param {string} filePath 
     * @param {Date} create_time
     */
    constructor(id, count, product_id, first, latest, filePath, create_time) {
        this.id = id;
        this.count = count;
        this.product_id = product_id;
        this.first = first;
        this.latest = latest;
        this.filepath = filePath;
        this.create_time = create_time;
    }
}

module.exports = Generaterecords;