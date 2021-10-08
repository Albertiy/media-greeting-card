class Music {
    id;
    product_id;
    name;
    author;
    path;
    order;

    /**
     * 
     * @param {number} id 
     * @param {number} product_id 
     * @param {string} name 
     * @param {string} author 
     * @param {string} path 
     * @param {number} order 
     */
    constructor(id, product_id, name, author, path, order) {
        this.id = id;
        this.product_id = product_id;
        this.name = name;
        this.author = author;
        this.path = path;
        this.order = order;
    }
}