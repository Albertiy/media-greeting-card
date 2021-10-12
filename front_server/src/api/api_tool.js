import { AxiosResponse } from "axios";
import ReqBody from "../model/req_body";

/**
 * 统一axios API数据剥离接口
 * @param {Promise<AxiosResponse<any>>} input_promise 
 * @returns {Promise<>}
 */
export function apiProcessor(input_promise) {
    return new Promise((resolve, reject) => {
        input_promise.then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        })
    })
}