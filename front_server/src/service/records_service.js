import * as RecordsAPI from '../api/records_api';
import GenerateRecords from '../model/generaterecords';

/**
 * 获取二维码生成记录
 * @param {Date} [startTime] 查询开始时间
 * @param {Date} [endTime] 查询结束时间
 * @param {number} [id] 数据编号
 * @returns {Promise<GenerateRecords>} 返回二维码生成记录列表
 */
export function getRecords(startTime, endTime, id) {
    let params = {};
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (id) params.id = id;
    return new Promise((resolve, reject) => {
        RecordsAPI.getRecords(params).then(res => {
            console.log('【获取二维码生成记录】 RES: %o', res)
            resolve(res)
        }).catch(err => {
            console.log('【获取二维码生成记录】 ERROR: %o', err)
            reject(err)
        })
    })
}

/**
 * 批量生成二维码
 * @param {number} count 要生成的数量
 * @param {number} productId 要生成的产品
 * @returns {Promsise<string>} 返回生成的二维码包的路径
 */
export function generateCode(count, productId) {
    return new Promise((resolve, reject) => {
        RecordsAPI.generateCode(count, productId).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}