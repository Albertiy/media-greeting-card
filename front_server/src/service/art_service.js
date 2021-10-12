import * as ArtAPI from '../api/art_api';
import Product from '../model/product';

/**
 * 获取商品列表
 * @returns {Promise<Product[]>}
 */
export function getProducts() {
    return ArtAPI.getProductList();
}