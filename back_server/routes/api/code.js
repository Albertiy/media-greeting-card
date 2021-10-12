const dayjs = require('dayjs');
var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();

const codeService = require('../../src/service/code_service')
const dbService = require('../../src/service/db_service')

/** 批量获取二维码 */
router.post('/generateCode', function (req, res, next) {
    let { count, productId } = req.body;
    if (count && (count = parseInt(count)) > 0) {
        let startTime = new Date();
        console.log('[generateCode] count = %o, productId = %o', count, productId);
        // step1: 批量生成二维码code
        let codes = codeService.getBatchCode(count);
        // step2: 批量拼接接口，并生成二维码图片，然后打成压缩包，返回相对地址，以供前端点击链接下载
        codeService.genQrFiles(codeService.getBatchQrLink(codes))
            .then((path) => {
                console.log('|| 生成 %d 张二维码，共耗时 %d 秒', count, dayjs().diff(startTime, "seconds"));
                let zipFilePath = path;  // 生成的压缩文件的相对路径
                // TODO 为了实现数据库事务和回滚，需要将数据库多条查询语句合并到一个服务中。
                // TODO 因此，要调整文件服务和数据库服务的顺序，或者让数据库的回调可以返回 connection 对象（在关闭前），让它帮忙 rollback。
                // 其实吧。。。正常也不会有问题的。但是就当是学新知识了。
                // step3: 数据库批量插入生成的二维码，并插入生成记录
                dbService.insertCodesAndRecord(codes, zipFilePath, productId).then((result) => {
                    // step4: 通过 api/file/ 接口拼接相对路径，直接读取文件。
                    res.send(new ReqBody(1, zipFilePath));
                }).catch((err) => {
                    res.send(new ReqBody(0, null, err));
                });
            }).catch((err) => {
                res.send(new ReqBody(0, null, err))
            });
    } else {
        res.send(new ReqBody(0, null, 'need param count'))
    }
})

router.get('/record', (req, res, next) => {
    let { id } = req.query;
    if (id) {
        id = parseInt(id);
        dbService.getRecords({ id }).then((result) => {
            // console.log("result: %o", result[0]);
            if (result.length > 0)
                res.send(new ReqBody(1, result[0]))
            else
                res.send(new ReqBody(0, null, '未查询到对应记录'))
        }).catch((err) => {
            res.send(new ReqBody(0, null, err))
        });
    } else {
        res.send(new ReqBody(0, null, '缺少必要参数'))
    }
})

router.get('/records', function (req, res, next) {
    let { id, startTime, endTime } = req.query;
    if (id) id = parseInt(id);
    dbService.getRecords({ id, startTime, endTime }).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.post('/lock', function (req, res, next) {
    let { code, lock } = req.body;
    if (code === undefined || lock === undefined) {
        res.send(new ReqBody(0, null, '缺少必要参数'))
    } else {
        dbService.setLock(code, lock).then((result) => {
            res.send(new ReqBody(1, result))
        }).catch((err) => {
            res.send(new ReqBody(0, null, err))
        });
    }
})

module.exports = router;