var express = require('express');
var router = express.Router();

const dbService = require('../../src/service/db_service');
const tokenService = require('../../src/service/tokenService');
const tools = require('../../src/tool/tools');
var ReqBody = require('../../src/model/req_body');
const ApiTools = require('./api_tools');

const appConfig = require('../../config.js').application();

/** 登录：从数据库验证密码，更新Cookie，设置或更新Cookie，错误则不管Cookie（反正不是logout） */
router.post('/login', (req, res, next) => {
    let { code, modify_pwd } = req.body;
    if (!code || !modify_pwd) { ApiTools.errorNeedParams(res); return; }
    dbService.getUploadInfo(code).then((result) => {
        if (!result) { errorWrongCode(res); return; }
        else if (result.modify_pwd != modify_pwd) {
            ApiTools.errorMessage('密码错误😐'); return;
        } else {
            // TODO 生成Token，存入cookie，返回 ok
        }
        tokenService.genToken()
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

/** 修改密码：从数据库验证密码，若旧密码正确，更新数据库，更新Cookie */
router.post('/changepwd', (req, res, next) => {
    let { code, old_pwd, new_pwd } = req.body;
    if (!code || !old_pwd || !new_pwd) { ApiTools.errorNeedParams(res); return; }
    dbService.changeModifyPwd(code, modify_pwd).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.post('/access', (req, res, next) => {
    let { code, access_pwd } = req.body;
    if (!code || !access_pwd) { errorNeedParams(res); return; }
    dbService.getUploadInfo(code).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

router.post('/changeaccesspwd', (req, res, next) => {
    let { code, new_pwd } = req.body;
    if (!code) { errorNeedParams(res) }
    dbService.changeAccessPwd(code, modify_pwd).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

module.exports = router;