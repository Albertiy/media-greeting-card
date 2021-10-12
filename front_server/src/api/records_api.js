import axios from 'axios';
import dayjs from 'dayjs';
import ReqBody from '../model/req_body';
import GenerateRecords from '../model/generaterecords';

const getRecordsUrl = '/api/records';
const generateCodeUrl = "/api/generateCode";

/**
 * 获取二维码生成记录
 * @param {{startTime: Date, endTime: Date, id: number}} params 查询参数
 * @returns {Promise<GenerateRecords[]>} 返回二维码生成记录列表
 */
export function getRecords(params = {}) {
    if (params.startTime) params.startTime = dayjs(params.startTime).format('YYYY-MM-DD HH:mm:ss');
    if (params.endTime) params.endTime = dayjs(params.endTime).format('YYYY-MM-DD HH:mm:ss');
    console.log('【获取二维码生成记录】 params: %o', params)
    return new Promise((resolve, reject) => {
        axios.get(getRecordsUrl, { params: params }).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 批量生成二维码
 * @param {number} count 要生成的数量
 * @param {number} productId 要生成的产品
 * @returns {Promise<string>} 返回生成的二维码包的路径
 */
export function generateCode(count, productId) {
    return new Promise((resolve, reject) => {
        let data = { count, productId }
        axios.post(generateCodeUrl, data).then((result) => {
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        })
    })
}