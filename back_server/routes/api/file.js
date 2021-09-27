var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var formidable = require('formidable');
var uuidV1 = require('uuid').v1;

const fileService = require('../../src/service/file_service');
const dbService = require('../../src/service/db_service');
const tools = require('../../src/tool/tools');
var ReqBody = require('../../src/model/req_body');

const appConfig = require('../../config.js').application();
const VIDEO_ROOT = appConfig.videoFileRoot;
const AUDIO_ROOT = appConfig.audioFileRoot;

/**
 * 更新祝福文本
 */
router.post('/uploadGreetingText', function (req, res, next) {
    try {
        let data = req.body;
        console.log('data: %o', data);
        let { code, textFrom, textTo } = data;
        if (!code || (!textFrom && !textTo)) { res.send(new ReqBody(0, null, '缺少必要参数！')) }
        else {
            // 更新数据
            dbService.updateGreetingText(data).then((result) => {
                res.send(new ReqBody(1, result))
            }).catch((err) => {
                res.send(new ReqBody(0, null, err))
            });
        }
    } catch (e) {
        res.send(new ReqBody(0, null, e))
    }
})

/**
 * 上传音频和视频
 */
router.post('/uploadGreetingFiles', function (req, res, next) {
    try {
        let tempPath = path.resolve(fileService.getFileRoot(), './temp');
        console.log('tempPath: %o', tempPath);
        let rootUrl = fileService.getFileRoot();
        fileService.mkdirsSync(tempPath);
        let maxFileSize = 100 * 1024 * 1024;

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
            console.log('data: ' + data.name)
        })

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log('formidable parse error: %o', err.message)
                res.send(new ReqBody(0, null, err.message))
            } else {
                console.log(fields);
                console.log('上传文件数：%o', Object.keys(files).length);
                let { code } = fields;
                if (!code) {
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                } else {
                    try {
                        dbService.getUploadInfo(code).then((result) => {
                            console.log('是有效的code!')
                            let oldAudioPath = result.audioPath;    // 用于删除旧文件
                            let oldVideoPath = result.videoPath;    // 用于删除旧文件

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
                                    let dbAudioPath, dbVideoPath;   // 用于存储到数据库
                                    // 音频
                                    if (audioFileIdx != -1) {
                                        let audioFile = files[keys[audioFileIdx]];
                                        console.log(`|| 文件信息：${audioFile.name} ${audioFile.type} ${audioFile.size} ${audioFile.lastModifiedDate}`);
                                        if (audioFile && audioFile.size > 0) {  // 保存音频文件
                                            console.log('|| 临时路径:' + audioFile.path);
                                            let audioRelPath = tools.expandFileName((tools.validateFileName(audioFile.name) ? audioFile.name : tools.correctingFileName(audioFile.name)), null, '-' + code + '-' + uuidV1());
                                            dbAudioPath = path.join(AUDIO_ROOT, audioRelPath);
                                            console.log('|| 数据库存储路径:' + dbAudioPath);
                                            let audioAbsPath = path.resolve(rootUrl, AUDIO_ROOT, audioRelPath)
                                            console.log('|| 存储路径:' + audioAbsPath)
                                            fileService.mkdirsSync(path.dirname(audioAbsPath));   // 若目录不存在，创建之
                                            fs.renameSync(audioFile.path, audioAbsPath);
                                        }
                                    }
                                    // 视频
                                    if (videoFileIdx != -1) {
                                        let videoFile = files[keys[videoFileIdx]];
                                        console.log(`|| 文件信息：${videoFile.name} ${videoFile.type} ${videoFile.size} ${videoFile.lastModifiedDate}`);
                                        if (videoFile && videoFile.size > 0) {  // 保存视频文件
                                            console.log('|| 临时路径:' + videoFile.path);
                                            let videoRelPath = tools.expandFileName((tools.validateFileName(videoFile.name) ? videoFile.name : tools.correctingFileName(videoFile.name)), null, '-' + code + '-' + uuidV1());
                                            // videoRelPath += tools.getExtName(videoFile.name)
                                            dbVideoPath = path.join(AUDIO_ROOT, audioRelPath);
                                            console.log('|| 数据库存储路径:' + dbVideoPath);
                                            let videoAbsPath = path.resolve(rootUrl, VIDEO_ROOT, videoRelPath)
                                            console.log('|| 存储路径:' + videoAbsPath)
                                            fileService.mkdirsSync(path.dirname(videoAbsPath));   // 若目录不存在，创建之
                                            fs.renameSync(videoFile.path, videoAbsPath);
                                        }
                                    }
                                    dbService.updateGreetingFiles({ code, dbVideoPath, dbAudioPath }).then((result) => {
                                        // 删除旧文件
                                        if (oldAudioPath) { oldAudioPath = path.resolve(rootUrl, oldAudioPath); fs.rmSync(oldAudioPath, { force: true }); }
                                        if (oldVideoPath) { oldVideoPath = path.resolve(rootUrl, oldVideoPath); fs.rmSync(oldVideoPath, { force: true }); }
                                        res.send(new ReqBody(1, "上传成功"));
                                    }).catch((err) => {
                                        res.send(new ReqBody(0, null, err));
                                    });
                                }
                            } else {
                                res.send(new ReqBody(0, null, '文件上传失败'))
                            }
                        }).catch((err) => {
                            res.send(new ReqBody(0, null, err))
                        });
                    } catch (e) {
                        res.send(new ReqBody(0, null, '参数格式错误'))
                        return;
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
 * 读取上传信息
 */
router.post('/getGreetingFiles', function (req, res, next) {
    let { code } = req.body;
    console.log('code: ' + code)
    if (!code) { res.send(new ReqBody(0, null, '缺少必要参数')); return; }
    dbService.getUploadInfo(code).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
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