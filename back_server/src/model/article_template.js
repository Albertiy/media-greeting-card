class ArticleTemplate {
    id;
    name;
    skeleton;
    selectable;
    order;

    /**
     * 
     * @param {number} id 
     * @param {object} skeleton 
     */
    constructor(id, name, skeleton, selectable, order) {
        this.id = id;
        this.name = name;
        this.skeleton = skeleton;
        this.selectable = selectable;
        this.order = order;
    }
}