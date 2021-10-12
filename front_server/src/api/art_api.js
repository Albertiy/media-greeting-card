import axios from 'axios';
import ReqBody from '../model/req_body';
import Product from '../model/product';


const getProductListUrl = '/api/productlist';

/**
 * 
 * @returns  {Promise<Product[]>}
 */
export function getProductList() {
    return new Promise((resolve, reject) => {
        axios.get(getProductListUrl).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}