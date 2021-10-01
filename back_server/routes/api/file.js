var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var formidable = require('formidable');
var uuidV1 = require('uuid').v1;

const fileService = require('../../src/service/file_service');
const dbService = require('../../src/service/db_service');
const mediaService = require('../../src/service/media_service');
const tools = require('../../src/tool/tools');
var ReqBody = require('../../src/model/req_body');

const appConfig = require('../../config.js').application();
const VIDEO_ROOT = appConfig.videoFileRoot;
const AUDIO_ROOT = appConfig.audioFileRoot;
const SOURCE_SUFFIX = '-source';    // 标识源文件的后缀
const TEMP_SUFFIX = '-temp';        // 标识转换出的文件的后缀，防止文件名冲突
const AUDIO_EXTNAME = '.m4a';
const VIDEO_EXTNAME = '.mp4';

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
        /** 文件上传最大尺寸 */
        const maxFileSize = 100 * 1024 * 1024;
        /** 根存储路径 */
        const rootStoragePath = fileService.getFileRoot();
        /** 临时文件路径 */
        const tempFilePath = path.resolve(rootStoragePath, './temp');
        fileService.mkdirsSync(tempFilePath);
        console.log('tempPath: %o', tempFilePath);

        let form = new formidable.IncomingForm({
            uploadDir: tempFilePath,
            keepExtensions: true,
            maxFileSize: maxFileSize,
        });
        form.on('field', (name, value) => { console.log('[formidable] field: name=%o, value=%o', name, value) }) // 文本域
        form.on('fileBegin', (formName, file) => { console.log('[formidable] file: ', formName, file.name, file.size) })
        form.on('file', (formName, file) => { console.log('[formidable] file: ', formName, file.name, file.size) })    // 二进制域
        form.on('error', err => { console.log('[formidable] error: %o', err.message) })
        form.on('aborted', () => { console.log('[formidable] aborted!') })
        form.on('data', data => { console.log('[formidable] data: ' + data.name) })  // 似乎没有作用
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log('[formidable] parse error: %o', err.message)
                res.send(new ReqBody(0, null, err.message))
                return;
            } else {
                console.log('|| 上传文件数: %o', Object.keys(files).length);
                console.log(fields);
                let { code } = fields;
                if (!code) {
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                    return;
                }
                try {
                    dbService.getUploadInfo(code).then((result) => {
                        console.log('|| code有效')
                        /** 旧音频文件 */
                        const oldAudioPath = result.audioPath ? path.resolve(rootStoragePath, result.audioPath) : null;
                        /** 旧视频文件 */
                        const oldVideoPath = result.videoPath ? path.resolve(rootStoragePath, result.videoPath) : null;

                        if (Object.keys(files).length > 0) {
                            let keys = [];
                            Object.keys(files).forEach(key => {
                                keys.push(key);
                            });
                            console.log(keys);
                            let audioFileIdx = keys.findIndex(value => value == 'audioFile')
                            let videoFileIdx = keys.findIndex(value => value == 'videoFile')
                            if (audioFileIdx == -1 && videoFileIdx == -1) {
                                res.send(new ReqBody(0, null, '未上传文件'))
                                return;
                            } else {
                                /** 数据库存储的音频路径 */
                                let audioDbPath = '';
                                /** 数据库存储的视频路径 */
                                let videoDbPath = '';
                                /** 文件转换的Promise列表 */
                                let promList = [];
                                // 音频
                                if (audioFileIdx != -1) {
                                    let audioFile = files[keys[audioFileIdx]];
                                    console.log(`|| 音频文件：${audioFile.name} ${audioFile.type} ${audioFile.size} ${audioFile.lastModifiedDate}`);
                                    if (audioFile && audioFile.size > 0) {  // 保存音频文件
                                        /** 音频临时路径 */
                                        const audioTempPath = audioFile.path;
                                        console.log('|| 音频临时路径:' + audioTempPath);
                                        /** 音频文件名 */
                                        const audioName = tools.expandFileName((tools.validateFileName(audioFile.name) ? audioFile.name : tools.correctingFileName(audioFile.name)), null, '-' + code + '-' + uuidV1());
                                        // 数据库中音频路径相对于根存储路径，此处替换格式转换后的文件扩展名
                                        audioDbPath = path.join(AUDIO_ROOT, tools.replaceExtName(audioName, AUDIO_EXTNAME));
                                        console.log('|| 音频DB路径:' + audDioDbPath);
                                        /** 假设音频文件移动到对应位置时的绝对路径 */
                                        const audioAbsPath = path.resolve(rootStoragePath, AUDIO_ROOT, audioName)
                                        console.log('|| 音频绝对路径:' + audioAbsPath)
                                        fileService.mkdirsSync(path.dirname(audioAbsPath));   // 若目录不存在，创建之
                                        // fs.renameSync(audioTmpPath, audioAbsPath);    // 移动文件（这一步省略，直接在临时目录转换后移动）
                                        /** 格式转换文件的临时路径 */
                                        const audioTransPath = tools.expandFileName(tools.replaceExtName(audioAbsPath, AUDIO_EXTNAME), null, TEMP_SUFFIX);
                                        console.log('|| 音频转换路径:' + audioTransPath)
                                        // 格式转换 + 重命名
                                        promList.push(mediaService.audioToM4a(audioTempPath, audioTransPath).then((result) => {
                                            /** 音频源文件最终路径 */
                                            const audioSrcPath = tools.expandFileName(audioAbsPath, null, SOURCE_SUFFIX);
                                            console.log('|| 音频源文件路径：' + audioSrcPath)
                                            fs.renameSync(audioTempPath, audioSrcPath);  // 移动源文件
                                            fs.renameSync(audioTransPath, tools.replaceExtName(audioAbsPath, AUDIO_EXTNAME));   // 重命名转换文件
                                        }).catch((err) => {
                                            console.log(err);
                                            console.log('音频文件格式转换失败！不进行文件替换工作');
                                        }))
                                    }
                                }
                                // 视频
                                if (videoFileIdx != -1) {
                                    let videoFile = files[keys[videoFileIdx]];
                                    console.log(`|| 视频文件：${videoFile.name} ${videoFile.type} ${videoFile.size} ${videoFile.lastModifiedDate}`);
                                    if (videoFile && videoFile.size > 0) {  // 保存视频文件
                                        const videoTempPath = videoFile.path;
                                        console.log('|| 视频临时路径:' + videoTempPath);
                                        /** 视频文件名 */
                                        const videoName = tools.expandFileName((tools.validateFileName(videoFile.name) ? videoFile.name : tools.correctingFileName(videoFile.name)), null, '-' + code + '-' + uuidV1());
                                        // 数据库记录替换文件名的路径
                                        videoDbPath = path.join(VIDEO_ROOT, tools.replaceExtName(videoName, VIDEO_EXTNAME));
                                        console.log('|| 视频DB路径:' + videoDbPath);
                                        /** 音频源文件当前的绝对路径 */
                                        const videoAbsPath = path.resolve(rootStoragePath, VIDEO_ROOT, videoName)
                                        console.log('|| 视频绝对路径:' + videoAbsPath)
                                        fileService.mkdirsSync(path.dirname(videoAbsPath));   // 若目录不存在，创建之
                                        // fs.renameSync(videoTempPath, videoAbsPath);    // 移动文件（这一步可以省略，直接在临时目录转换即可）
                                        const videoTransPath = tools.expandFileName(tools.replaceExtName(videoAbsPath, VIDEO_EXTNAME), null, TEMP_SUFFIX);
                                        console.log('|| 视频转换路径:' + videoTransPath)
                                        // 格式转换 + 重命名
                                        promList.push(mediaService.videoToMp4(videoTempPath, videoTransPath).then((result) => {
                                            /** 视频源文件最终路径 */
                                            const sourceAbsPath = tools.expandFileName(videoAbsPath, null, SOURCE_SUFFIX);
                                            console.log('|| 视频源文件路径：' + sourceAbsPath)
                                            fs.renameSync(videoTempPath, sourceAbsPath);  // 移动源文件
                                            fs.renameSync(videoTransPath, tools.replaceExtName(videoAbsPath, VIDEO_EXTNAME));   // 重命名转换文件
                                        }).catch((err) => {
                                            console.log(err);
                                            console.log('视频文件格式转换失败！不进行文件替换工作');
                                        }))
                                    }
                                }
                                Promise.all(promList).then((result) => {
                                    dbService.updateGreetingFiles({ code, dbVideoPath: videoDbPath, dbAudioPath: audioDbPath }).then((result) => {
                                        // 删除旧的源文件和生成文件，需要使用通配符方式（因为后缀有变化，没有记录到数据库）
                                        if (oldAudioPath) {
                                            let oldSourceAudioPath = tools.expandFileName(oldAudioPath, null, SOURCE_SUFFIX);
                                            fs.rmSync(oldAudioPath, { force: true });
                                            glob(tools.replaceExtName(oldSourceAudioPath, '.*'), (err, files) => {
                                                if (!err && files.length > 0)
                                                    fs.rmSync(files[0], { force: true });
                                                else
                                                    console.log('[error] 删除旧源文件失败: %o', oldSourceAudioPath)
                                            })
                                        }
                                        if (oldVideoPath) {
                                            let oldSourceVideoPath = tools.expandFileName(oldVideoPath, null, SOURCE_SUFFIX);
                                            fs.rmSync(oldVideoPath, { force: true });
                                            glob(tools.replaceExtName(oldSourceVideoPath, '.*'), (err, files) => {
                                                if (!err && files.length > 0)
                                                    fs.rmSync(files[0], { force: true });
                                                else
                                                    console.log('[error] 删除旧源文件失败: %o', oldSourceVideoPath)
                                            })
                                        }
                                        res.send(new ReqBody(1, "上传成功"));
                                    }).catch((err) => {
                                        console.log(err);
                                        res.send(new ReqBody(0, null, err));
                                    });
                                }).catch((err) => {
                                    res.send(new ReqBody(0, null, '格式转换失败'))
                                    return;
                                });
                            }
                        } else {
                            res.send(new ReqBody(0, null, '文件上传失败'))
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.send(new ReqBody(0, null, err))
                        return;
                    })
                } catch (e) {
                    console.log(e);
                    res.send(new ReqBody(0, null, '参数格式错误'))
                    return;
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