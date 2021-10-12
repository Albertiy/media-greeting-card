import * as ArtAPI from '../api/art_api';
import Article from '../model/article';
import Product from '../model/product';


/**
 * 获取商品列表
 * @returns {Promise<Product[]>}
 */
export function getProducts() {
    return ArtAPI.getProductList();
}

/**
 * 获取文章
 * @param {number} codeId
 * @returns {Promise<Article>}
 */
export function getArticle(codeId) {
    return ArtAPI.getArticle(codeId);
}