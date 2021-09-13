class Generagerecords {
    id;
    count;
    first;
    latest;
    filePath;
    create_time;

    /**
     * 数据库 uploadfiles 表
     * @param {number} id 
     * @param {number} count 
     * @param {string} first 
     * @param {string} latest 
     * @param {string} filePath 
     * @param {Date} create_time
     */
    constructor(id, count, first, latest, first, create_time) {
        this.id = id;
        this.count = count;
        this.first = first;
        this.latest = latest;
        this.filepath = filePath;
        this.create_time = create_time;
    }
}