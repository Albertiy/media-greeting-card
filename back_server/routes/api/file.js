var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var formidable = require('formidable');
var uuidV1 = require('uuid').v1;

const fileService = require('../../src/service/file_service');
const tools = require('../../src/tool/tools');
var ReqBody = require('../../src/model/req_body');

const appConfig = require('../../config.js').application();
const VIDEO_ROOT = appConfig.videoFileRoot;
const AUDIO_ROOT = appConfig.audioFileRoot;

// router.get('/uploadGreetingFiles', function (req, res, next) {
//     res.send({ ok: 1 })
// })

/**
 * 上传音频和视频
 */
router.post('/uploadGreetingFiles', function (req, res, next) {
    try {
        let tempPath = path.resolve(fileService.getFileRoot(), './temp');
        console.log('tempPath: %o', tempPath);
        let rootUrl = fileService.getFileRoot();
        fileService.mkdirsSync(tempPath);
        let maxFileSize = 60 * 1024 * 1024;

        let form = new formidable.IncomingForm({
            uploadDir: tempPath,
            keepExtensions: true,
            maxFileSize: maxFileSize,
        });
        form.on('field', (name, value) => {
            console.log('name: %o, value: %o', name, value)
        })
        form.on('fileBegin', (formName, file) => {
            console.log(formName, file.name, file.size)
        })
        form.on('file', (formName, file) => {
            console.log(formName, file.name, file.size)
        })
        form.on('error', err => {
            console.log('|| formidable error：%o', err.message);
        })
        form.on('aborted', () => {
            console.log('|| formidable aborted!')
        })
        // 没有作用？
        form.on('data', data => {
            console.log('data: ')
            console.log(data.name)
        })

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log('formidable parse error: %o', err.message)
                res.send(new ReqBody(0, null, err.message))
            } else {
                console.log(fields);
                console.log('上传文件数：%o', Object.keys(files).length);
                let { } = fields;
                if (false) {
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                } else {
                    try {

                    } catch (e) {
                        res.send(new ReqBody(0, null, '参数格式错误'))
                        return;
                    }
                    if (Object.keys(files).length > 0) {
                        let keys = [];
                        Object.keys(files).forEach(key => {
                            keys.push(key);
                        });
                        console.log(keys);
                        let audioFileIdx = keys.findIndex(value => value == 'audioFile')
                        let videoFileIdx = keys.findIndex(value => value == 'videoFile')
                        if (audioFileIdx == -1 && videoFileIdx == -1) {
                            res.send(new ReqBody(0, null, '文件为空'))
                        } else {
                            // 音频
                            if (audioFileIdx != -1) {
                                let audioFile = files[keys[audioFileIdx]];
                                console.log(audioFile);
                                if (audioFile && audioFile.size > 0) {
                                    console.log('|| 临时路径:' + audioFile.path);
                                    let audioRelPath = tools.expandFileName((tools.validateFileName(audioFile.name) ? audioFile.name : tools.correctingFileName(audioFile.name)), null, '-' + uuidV1());
                                    let audioAbsPath = path.resolve(rootUrl, AUDIO_ROOT, audioRelPath)
                                    console.log('|| 存储路径:' + audioAbsPath)
                                    fs.renameSync(audioFile.path, audioAbsPath);
                                }

                                // dbService.addProductItem(name, product, categories, audioRelPath, linkUrl).then(val => {
                                //       // 确保写入数据库后再移动文件，若记录创建失败则文件待在临时文件夹中，便于区分
                                //     if (thumbPicIdx != -1) {
                                //         let thumbPic = files[keys[thumbPicIdx]]
                                //         fs.renameSync(thumbPic.path, thumbAbsolutePath)
                                //         console.log('thumbPic 存储路径:' + thumbAbsolutePath)
                                //     } else {
                                //         console.log('没有上传缩略图')
                                //     }
                                //     res.send(new ReqBody(1, val))
                                // }).catch(err => {
                                //     res.send(new ReqBody(0, null, err))
                                // })
                            }
                            // 视频
                            if (videoFileIdx != -1) {
                                let videoFile = files[keys[videoFileIdx]];
                                console.log(videoFile);
                                if (videoFile && videoFile.size > 0) {
                                    console.log('|| 临时路径:' + videoFile.path);
                                    let videoRelPath = (tools.validateFileName(videoFile.name) ? videoFile.name : tools.correctingFileName(videoFile.name)) + '-' + uuidV1();
                                    videoRelPath += tools.getExtName(videoFile.name)
                                    let videoAbsPath = path.resolve(rootUrl, VIDEO_ROOT, videoRelPath)
                                    console.log('|| 存储路径:' + videoAbsPath)
                                    fs.renameSync(videoFile.path, videoAbsPath);
                                }
                            }
                            res.send(new ReqBody(1, "上传成功"))
                        }
                    } else {
                        res.send(new ReqBody(0, null, '文件上传失败'))
                    }
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.send(new ReqBody(0, null, error))
    }
});

/**
 * 获取文件
 * 参数：文件相对于根文件夹的路径
 * 文件名不作为路径的参数，而是作为path的一部分。可能需要 uldecode 解码。
 */
router.get('/file/*', function (req, res, next) {
    // let { thumb } = req.query;  // 也可以有额外的参数
    /** @type{string} */
    let filePath = req.params[0];
    let absoluteFilePath = path.join(fileService.getFileRoot(), filePath);
    console.log('file: %s', absoluteFilePath);
    res.sendFile(absoluteFilePath); // 传输为字节流文件
});

module.exports = router;