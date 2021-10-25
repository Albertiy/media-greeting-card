import axios from 'axios';
import Article from '../model/article';
import Product from '../model/product';
import ReqBody from '../model/req_body';
import { apiProcessor } from './api_tool';

const getProductListUrl = '/api/productlist';
const getArticleUrl = '/api/article';
const getRecordAndArticleUrl = '/api/recordandarticle';
const getBgImageUrl = '/api/bgimage';
const getMusicUrl = '/api/music';
const updateTextUrl = '/api/updatetext';
const getImageUrl = 'api/image';
const updateImageUrl = 'api/updateimage';
const updateCustomBgImageUrl = 'api/updatecustombgimage';

/**
 * 
 * @returns  {Promise<Product[]>}
 */
export function getProductList() {
    return apiProcessor(axios.get(getProductListUrl))
}

/**
 * 通过 code_id 获取图文内容对象
 * @param {number} codeid 文章对应的二维码的数据库记录id
 * @returns {Promise<Article>}
 */
export function getArticle(codeid) {
    return apiProcessor(axios.get(getArticleUrl, { params: { codeid } }))
}

export function getRecordAndArticle(code) {
    return apiProcessor(axios.get(getRecordAndArticleUrl, { params: { code } }))
}

export function getBgImage(id) {
    return apiProcessor(axios.get(getBgImageUrl, { params: { id } }))
}

export function getMusic(id) {
    return apiProcessor(axios.get(getMusicUrl, { params: { id } }))
}

export function updateText(code, title, content) {
    let data = { code, title, content }
    return apiProcessor(axios.post(updateTextUrl, data))
}

export function getImage(id) {
    return apiProcessor(axios.get(getImageUrl, { params: { id } }))
}

export function updateImage(data) {
    return apiProcessor(axios.post(updateImageUrl, data))
}

export function updateCustomBgImage(data) {
    return apiProcessor(axios.post(updateCustomBgImageUrl, data))
}