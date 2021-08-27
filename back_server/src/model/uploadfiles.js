class Uploadfiles {
    id;
    uuid;
    videoPath;
    audioPath;
    isLocked;
    isDeleted;

    /**
     * 数据库 uploadfiles 表
     * @param {number} id 
     * @param {string} uuid 
     * @param {string} videoPath 
     * @param {string} audioPath 
     * @param {boolean} isLocked 
     * @param {boolean} isDeleted 
     */
    constructor(id, uuid, videoPath, audioPath, isLocked, isDeleted) {
        this.id = id;
        this.uuid = uuid;
        this.videoPath = videoPath;
        this.audioPath = audioPath;
        this.isLocked = isLocked;
        this.isDeleted = isDeleted;
    }
}