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
    let params = { startTime, endTime, id };
    return new Promise((resolve, reject) => {
        RecordsAPI.getRecords(params).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}