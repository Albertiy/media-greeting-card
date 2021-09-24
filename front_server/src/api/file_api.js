import axios from 'axios';
import ReqBody from '../model/req_body';

const uploadGreetingFilesUrl = '/api/uploadGreetingFiles';

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