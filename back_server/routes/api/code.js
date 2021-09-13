var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();

const uuidService = require('../../src/service/uuid_service')

router.post('/generateCode', function (req, res, next) {
    let { count } = req.body;
    if (count && (count = parseInt(count)) > 0) {
        console.log('generateCode: count = %o', count);
        let codes = uuidService.getBatchUUID(count);
        // TODO 批量插入数据库
        console.log(codes);
        // TODO 批量拼接接口，并生成二维码包
        res.send(new ReqBody(1, codes));
    } else {
        res.send(new ReqBody(0, null, 'need param count'))
    }
})

module.exports = router;