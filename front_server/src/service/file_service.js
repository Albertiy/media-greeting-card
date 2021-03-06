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
 * 上传可选两种文件之一
 * @param {string} code uuid编码
 * @param {File} videoFile 
 * @param {File} audioFile 
 * @param {(progressEvent: any) => void} uploadProgressCallback 上传进度回调函数
 * @returns 
 */
export function uploadGreetings(code, videoFile, audioFile, uploadProgressCallback) {
    return new Promise((resolve, reject) => {
        if (!videoFile && !audioFile) {
            reject('音频或视频必须至少有一个')
        } else {
            const data = new FormData();
            data.append('code', code);
            if (videoFile) data.append('videoFile', videoFile);
            if (audioFile) data.append('audioFile', audioFile);
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

/**
 * 上传文本信息
 * @param {string} code
 * @param {string} textFrom 
 * @param {string} textTo 
 */
export function uploadGreetingText(code, textFrom, textTo) {
    return new Promise((resolve, reject) => {
        if (!code) { reject('code不能为空') }
        else if (!textFrom || !textTo) { reject('文本不能为空') }
        else {
            FileAPI.uploadGreetingText(code, textFrom, textTo).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        }
    })

}

/**
 * 设置锁定状态，默认锁定
 * @param {string} code 
 * @param {boolean} state 
 * @returns 
 */
export function lock(code, state = true) {
    return new Promise((resolve, reject) => {
        if (!code) { reject('code不能为空') }
        else {
            FileAPI.setLockState(code, state).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        }
    })

}

/**
 * 验证管理密码
 * @param {*} code 
 * @param {*} password 
 * @returns 
 */
export function login(code, password) {
    return new Promise((resolve, reject) => {
        if (code && password != undefined && password != '') {
            FileAPI.login(code, password).then((res) => {
                console.log(res)
                resolve(res)
            }).catch((err) => {
                reject(err)
            });
        } else reject('编号和密码不能为空')
    })

}

/**
 * 修改管理密码
 * @param {*} code 
 * @param {*} oldPwd 
 * @param {*} newPwd 
 * @returns 
 */
export function changePwd(code, oldPwd, newPwd) {
    return new Promise((resolve, reject) => {
        if (code && oldPwd && newPwd) {
            FileAPI.changePwd(code, oldPwd, newPwd).then((res) => {
                console.log(res)
                resolve(res)
            }).catch((err) => {
                reject(err)
            });
        } else reject('编号和密码不能为空')
    })
}

/**
 * 验证访问密码，返回cookie值 access_token
 * @param {string} code 
 * @param {string} password 
 * @returns 
 */
export function access(code, password) {
    return new Promise((resolve, reject) => {
        if (code && password != undefined && password != '') {
            FileAPI.access(code, password).then((res) => {
                console.log(res)
                resolve(res)
            }).catch((err) => {
                reject(err)
            });
        } else reject('编号和密码不能为空')
    })
}

/**
 * 设置访问密码，无需原密码，清空访问密码则设置 password 为 null
 * @param {string} code 
 * @param {string} password 
 * @returns 
 */
export function setAccessPwd(code, password) {
    return new Promise((resolve, reject) => {
        if (code) {
            FileAPI.changeAccessPwd(code, password).then((result) => {
                console.log(result)
                resolve(result)
            }).catch((err) => {
                console.log(err)
                reject(err)
            });
        } else {
            reject('编号不能为空')
        }
    })
}