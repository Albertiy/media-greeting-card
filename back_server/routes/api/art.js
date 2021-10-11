var express = require('express');
const ReqBody = require('../../src/model/req_body');
var router = express.Router();

const dbService = require('../../src/service/db_service')

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

module.exports = router;