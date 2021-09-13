const dayjs = require('dayjs');
var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();

const codeService = require('../../src/service/code_service')
const dbService = require('../../src/service/db_service')

router.post('/generateCode', function (req, res, next) {
    let { count } = req.body;
    if (count && (count = parseInt(count)) > 0) {
        let startTime = new Date();
        console.log('[generateCode] count = %o', count);
        let codes = codeService.getBatchCode(count);
        // 批量插入数据库
        // dbService.insertCodes(codes).then((result) => {
        // 批量拼接接口，并生成二维码图片，然后打成压缩包，返回相对地址，以供前端点击链接下载
        codeService.genQrFiles(codeService.getBatchQrLink(codes)).then((val) => {
            console.log('|| 生成 %d 张二维码，共耗时 %d 秒', count, dayjs().diff(startTime, "seconds"));
            let dirPath = val;  // 此批次生成图片的文件夹相对fileRoot的路径 
            // TODO 得到生成的压缩文件的路径，存储到生成记录中
            // dbService.insertGenerateRecord(count, codes[0], codes[codes.length - 1], filePath).then((result) => {
            // TODO 返回生成的文件路径，可通过 api/file/ 接口直接读取文件。
            res.send(new ReqBody(1, dirPath));
            // }).catch((err) => {
            //     res.send(new ReqBody(0, null, err));
            // });
        }).catch((err) => {
            res.send(new ReqBody(0, null, err));
        });
        // }).catch((err) => {
        //     res.send(new ReqBody(0, null, err))
        // });
    } else {
        res.send(new ReqBody(0, null, 'need param count'))
    }
})

module.exports = router;