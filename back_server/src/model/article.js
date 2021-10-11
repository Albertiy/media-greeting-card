class Article {
    id;
    code_id;
    template_id;
    skeleton;
    paragraph_set;

    /**
     * 文章类
     * @param {number} id 
     * @param {number} code_id 
     * @param {number} template_id 
     * @param {object} skeleton 
     * @param {[]} paragraph_set 
     */
    constructor(id, code_id, template_id, skeleton, paragraph_set) {
        this.id = id;
        this.code_id = code_id;
        this.template_id = template_id;
        this.skeleton = skeleton;
        this.paragraph_set = paragraph_set;
    }
}

module.exports = Article;