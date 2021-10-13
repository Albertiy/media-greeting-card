const ConnPool = require('./conn_pool')
const pool = ConnPool.getPool();
const ArticleTemplate = require('../model/article_template')

const getArticleTemplateListSql = 'select * from article_template';

const orderStr = ' order by `order` is null, `order` asc';

/**
 * 获取文章模板列表
 * @returns {ArticleTemplate[]}
 */
function getArticleTemplateList() {
    let query = getArticleTemplateListSql;
    query += orderStr;
    let data = [];
    return new Promise((resolve, reject) => {
        pool.query(query, data, (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

module.exports = {
    getArticleTemplateList,
}