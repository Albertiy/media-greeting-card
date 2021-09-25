import * as FileAPI from '../api/file_api';
import Uploadfiles from '../model/uploadfiles';

/**
 * 获取文件可用路径
 * @param {string} url 
 * @returns 
 */
export function getFile(url) {
    return '/api/file/' + url;
}

/**
 * 
 * @param {File} videoFile 
 * @param {File} audioFile 
 * @param {(progressEvent: any) => void} uploadProgressCallback 上传进度回调函数
 * @returns 
 */
export function uploadGreetings(videoFile, audioFile, uploadProgressCallback) {
    return new Promise((resolve, reject) => {
        if (!videoFile && !audioFile) {
            reject('音频或视频必须至少有一个')
        } else {
            const data = new FormData();
            data.append('videoFile', videoFile);
            data.append('audioFile', audioFile);
            FileAPI.uploadGreetingFiles(data, uploadProgressCallback).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        }
    })
}

/**
 * 
 * @param {string} code 
 * @returns {Promise<Uploadfiles>}
 */
export function getUploadInfo(code) {
    return new Promise((resolve, reject) => {
        if (!code) { reject('code不能为空') }
        else {
            FileAPI.getUploadInfo(code).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        }
    })
}