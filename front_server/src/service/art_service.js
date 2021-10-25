import * as ArtAPI from '../api/art_api';
import Article from '../model/article';
import Bgimage from '../model/bgimage';
import Music from '../model/music';
import Product from '../model/product';
import Uploadfiles from '../model/uploadfiles';
import Imagefiles from '../model/imagefiles';


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

/**
 * 
 * @param {number} id 
 * @returns {Promise<Bgimage>}
 */
export function getBgImage(id) {
    return ArtAPI.getBgImage(id);
}

/**
 * 
 * @param {number} id 
 * @returns {Promise<Music>}
 */
export function getMusic(id) {
    return ArtAPI.getMusic(id);
}

/**
 * 
 * @param {string} code 
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns 
 */
export function updateText(code, title, content) {
    return ArtAPI.updateText(code, title, content)
}

/**
 * 
 * @param {number} id 
 * @returns {Promise<Imagefiles>}
 */
export function getImage(id) {
    return ArtAPI.getImage(id);
}

/**
 * 
 * @param {string} code 
 * @param {File} imageFile 
 * @returns {Promise<>}
 */
export function updateImage(code, imageFile) {
    console.log('imageFile: %o', imageFile)
    const data = new FormData();
    data.append('code', code)
    data.append('image', imageFile, imageFile.name)
    return ArtAPI.updateImage(data);
}