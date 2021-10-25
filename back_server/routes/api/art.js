var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();
var path = require('path')
var ApiTools = require('./api_tools')
const formidable = require('formidable')
const uuidV1 = require('uuid').v1
var fs = require('fs')
const tools = require('../../src/tool/tools')

const dbService = require('../../src/service/db_service')
const fileService = require('../../src/service/file_service')

const appConfig = require('../../config.js').application();
const IMAGE_ROOT = appConfig.imageFileRoot;


router.get('/productlist', function (req, res, next) {
    dbService.getProductList().then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        console.log(err)
        res.send(new ReqBody(0, null, err))
    });
})

router.get('/musiclist', function (req, res, next) {
    dbService.getMusicList().then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.get('/bgimagelist', function (req, res, next) {
    dbService.getBgImageList().then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.get('/articletemplatelist', function (req, res, next) {
    dbService.getArticleTemplateList().then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

/** 获取文章对象；若codeid为空或codeid在uploadfiles中不存在，则返回错误；
    若codeid存在但 product_id 不等于2，则返回“产品类型错误”；
    若codeid存在且 product_id 为2，则查询 article 表；
    若article有数据，返回该记录；
    若article无数据，则新建一条记录，并返回该记录。
*/
router.get('/article', function (req, res, next) {
    let { codeid } = req.query;
    codeid = parseInt(codeid);
    if (!codeid) { res.send(new ReqBody(0, null, 'codeid不能为空！')); return }
    // 当前无需 template_id 参数，无需判断code_id是否存在（有外键）
    dbService.getOrCreateArticleByCodeId(codeid).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

/**
 * 一次性获取record和article对象（不使用视图，方便复用当前service）
 * 结构：{record, article}
 */
router.get('/recordandarticle', function (req, res, next) {
    let { code } = req.query;
    console.log('code: ' + code)
    if (!code) { res.send(new ReqBody(0, null, '缺少必要参数')); return; }
    dbService.getUploadInfo(code).then((uploadRecord) => {
        dbService.getArticleByCodeId(uploadRecord.id).then((article) => {
            let temp = uploadRecord;
            temp.access_pwd = null;
            temp.modify_pwd = null;
            console.log(article.skeleton)
            res.send(new ReqBody(1, { record: uploadRecord, article: article }))
        }).catch((err) => {
            res.send(new ReqBody(0, null, err))
        });
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.get('/bgimage', function (req, res, next) {
    let { id } = req.query;
    if (!id) { res.send(new ReqBody(0, null, '缺少必要参数')); return; }
    id = parseInt(id);
    console.log('id: ' + id)
    dbService.getBgImage(id).then((result) => {
        // let filePath = result.path;
        // console.log('path: %o', filePath)
        // let absPath = path.join(fileService.getFileRoot(), filePath);
        // console.log('absPath: %o', absPath)
        // res.sendFile(absPath)
        res.send(new ReqBody(1, result.path))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.get('/music', function (req, res, next) {
    let { id } = req.query;
    if (!id) { res.send(new ReqBody(0, null, '缺少必要参数')); return; }
    id = parseInt(id);
    console.log('id: ' + id)
    dbService.getMusic(id).then((result) => {
        res.send(new ReqBody(1, result.path))
    }).catch(err => { res.send(new ReqBody(0, null, err)) })
})

router.post('/updatetext', function (req, res, next) {
    let { code, title, content } = req.body;
    console.log('code: %o, title: %o, content: %o', code, title, content)
    if (!code || !title || !content) {
        res.send(new ReqBody(0, null, '缺少必要参数')); return;
    }
    dbService.updateArticleText(code, title, content).then((result) => {
        ApiTools.okMessage(res, result)
    }).catch((err) => {
        ApiTools.errorMessage(res, err)
    });
})

router.get('/image', function (req, res, next) {
    let { id } = req.query;
    if (!id) { ApiTools.errorNeedParams(res); return; }
    dbService.getImage(id).then((result) => {
        ApiTools.okMessage(res, result)
    }).catch((err) => {
        ApiTools.errorMessage(res, err)
    });

})

router.post('/updateimage', function (req, res, next) {
    try {
        let tempPath = path.resolve(fileService.getFileRoot(), './temp');
        let rootUrl = fileService.getFileRoot();
        fileService.mkdirsSync(tempPath);
        let maxFileSize = 10 * 1024 * 1024;

        // formidable 插件
        let form = new formidable.IncomingForm({
            uploadDir: tempPath,
            keepExtensions: true,
            maxFileSize: maxFileSize,
        });
        // 非文件字段
        form.on('field', (name, value) => {
            console.log('name: %o, value: %o', name, value)
        })
        // 文件传输开始
        form.on('fileBegin', (formName, file) => {
            console.log(formName, file.name, file.size)
        })
        // 文件传输结束
        form.on('file', (formName, file) => {
            console.log(formName, file.name, file.size)
        })

        form.on('error', err => {
            console.log('|| formidable error：%o', err.message);
        })

        form.on('aborted', () => {
            console.log('|| formidable aborted!')
        })
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
                let { code } = fields;
                if (!code) { // || !linkUrl
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                } else {
                    // 拼接自定义的文件名，格式 “<素材名>-uuid<扩展名>”
                    let mainRelativePath = (tools.validateFileName(code) ? code : tools.correctingFileName(code)) + '-' + uuidV1();
                    mainRelativePath = path.join(IMAGE_ROOT, mainRelativePath);
                    if (Object.keys(files).length > 0) {
                        let keys = []   // 目前是单图传输，以后可能会有多图。
                        Object.keys(files).forEach(key => {
                            keys.push(key)
                        })
                        console.log(keys)
                        let mainPicIdx = keys.findIndex(value => value == 'image')
                        // 原图
                        if (mainPicIdx != -1) {
                            let mainPic = files[keys[mainPicIdx]]
                            console.log('|| 临时文件路径:' + mainPic.path);
                            mainRelativePath += tools.getExtName(mainPic.name)
                            console.log('|| image数据库相对路径: ' + mainRelativePath)
                            let mainAbsolutePath = path.resolve(rootUrl, mainRelativePath)
                            console.log('|| image存储绝对路径:' + mainAbsolutePath)
                            dbService.updateArticleImage(code, mainRelativePath).then(val => {
                                let oldPath = val.oldPath;
                                fileService.mkdirsSync(path.dirname(mainAbsolutePath));   // 若目录不存在，创建之
                                fs.renameSync(mainPic.path, mainAbsolutePath);  // 确保写入数据库后再移动文件，若记录创建失败则文件待在临时文件夹中，便于区分
                                if (oldPath) fs.rmSync(path.resolve(rootUrl, oldPath));
                                ApiTools.okMessage(res, val.res)
                            }).catch(err => {
                                ApiTools.errorMessage(res, err)
                            })
                        } else {
                            res.send(new ReqBody(0, null, '原图上传失败'))
                        }
                    } else {
                        res.send(new ReqBody(0, null, '文件上传失败'))
                    }
                }
            }
        })
    } catch (e) {
        res.send(new ReqBody(0, null, e))
    }
})

module.exports = router;