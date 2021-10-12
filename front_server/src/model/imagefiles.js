export default class Imagefiles {
    id;
    code_id;
    path;
    temp_path;

    /**
     * 上传图片文件表
     * @param {number} id 
     * @param {number} code_id 
     * @param {string} path 
     * @param {number} temp_path 
     */
    constructor(id, code_id, path, temp_path) {
        this.id = id;
        this.product_id = code_id;
        this.path = path;
        this.order = temp_path;
    }
}