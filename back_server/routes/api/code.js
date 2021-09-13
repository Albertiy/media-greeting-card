var express = require('express');
var router = express.Router();

const uuidService = require('../../src/service/uuid_service')

router.post('/generateCode', function (req, res, next) {
    let { count } = req.body;
    if (count && count > 0) {
        let codes = uuidService.getBatchUUID();
        // TODO 批量插入数据库
        console.log(codes);
        // TODO 批量拼接接口，并生成二维码包

    }
})

module.exports = router;