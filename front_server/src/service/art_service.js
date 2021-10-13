import * as ArtAPI from '../api/art_api';
import Article from '../model/article';
import Product from '../model/product';
import Uploadfiles from '../model/uploadfiles';


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

/**
 * 同时获取record和article
 * @param {string} code 二维码uuid
 * @returns {Promise<{record: Uploadfiles, article: Article}>}
 */
export function getRecordAndArticle(code) {
    return ArtAPI.getRecordAndArticle(code);
}