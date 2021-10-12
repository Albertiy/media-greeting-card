var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();

const dbService = require('../../src/service/db_service')

router.get('/productlist', function (req, res, next) {
    dbService.getProductList().then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
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

module.exports = router;