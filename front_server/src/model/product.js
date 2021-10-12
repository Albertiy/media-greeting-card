export default class Product {
    id;
    name;

    /**
     * 商品大类
     * @param {number} id 
     * @param {string} name 
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}