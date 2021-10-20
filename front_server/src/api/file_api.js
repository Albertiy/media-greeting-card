import axios from 'axios';
import ReqBody from '../model/req_body';
import Uploadfiles from '../model/uploadfiles';
import { apiProcessor } from './api_tool';

const uploadGreetingFilesUrl = '/api/uploadGreetingFiles';
const getUploadInfoUrl = '/api/getGreetingFiles';
const uploadGreetingTextUrl = '/api/uploadGreetingText';
const setLockStateUrl = '/api/lock';
const loginUrl = '/api/login';
const accessUrl = '/api/access';
const changePwdUrl = '/api/changepwd';
const changeAccessPwdUrl = '/api/changeaccesspwd';

/**
 * 
 * @param {FormData} formData 表单数据
 * @param {(progressEvent: any) => void} [uploadProgressCallback] 上传进度回调函数
 */
export function uploadGreetingFiles(formData, uploadProgressCallback) {
    console.log(formData);
    return new Promise((resolve, reject) => {
        axios.post(uploadGreetingFilesUrl, formData, {
            onUploadProgress: function (progressEvent) { if (progressEvent && progressEvent.lengthComputable) { uploadProgressCallback(progressEvent) } }
        }).then((result) => {
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
 * 
 * @param {string} code 
 * @returns {Promise<Uploadfiles>}
 */
export function getUploadInfo(code) {
    return new Promise((resolve, reject) => {
        axios.post(getUploadInfoUrl, { code }).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data);
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 
 * @param {string} code 
 * @param {string} textFrom 
 * @param {string} textTo 
 * @returns 
 */
export function uploadGreetingText(code, textFrom, textTo) {
    let data = { code, textFrom, textTo };
    return new Promise((resolve, reject) => {
        axios.post(uploadGreetingTextUrl, data).then((result) => {
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
 * 
 * @param {string} code 
 * @param {boolean} state true：锁定；false：解锁
 * @returns 
 */
export function setLockState(code, state) {
    let data = { code, lock: state };
    return new Promise((resolve, reject) => {
        axios.post(setLockStateUrl, data).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })

}

export function login(code, password) {
    let data = { code, modify_pwd: password };
    return apiProcessor(axios.post(loginUrl, data))
}

export function access(code, password) {
    let data = { code, access_pwd: password }
    return apiProcessor(axios.post(accessUrl, data))
}

export function changePwd(code, oldPwd, newPwd) {
    let data = { code, old_pwd: oldPwd, new_pwd: newPwd }
    return apiProcessor(axios.post(changePwdUrl, data))
}

export function changeAccessPwd(code, pwd) {
    let data = { code, new_pwd: pwd }
    return apiProcessor(axios.post(changeAccessPwdUrl, data))
}