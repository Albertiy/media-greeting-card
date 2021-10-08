class Bgimage {
    id;
    product_id;
    name;
    author;
    order;

    /**
     * 
     * @param {number} id 
     * @param {number} product_id 
     * @param {string} name 
     * @param {string} path 
     * @param {number} order 
     */
    constructor(id, product_id, name, path, order) {
        this.id = id;
        this.product_id = product_id;
        this.name = name;
        this.path = path;
        this.order = order;
    }
}