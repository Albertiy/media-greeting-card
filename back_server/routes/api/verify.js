var express = require('express');
var router = express.Router();

const dbService = require('../../src/service/db_service');
const tokenService = require('../../src/service/tokenService');
const tools = require('../../src/tool/tools');
var ReqBody = require('../../src/model/req_body');
const ApiTools = require('./api_tools');

const appConfig = require('../../config.js').application();
const ModifyTokenName = 'modify_token';
const AccessTokenName = 'access_token';
const tokenOptions = { maxAge: appConfig.tokenExpires * 1000, path: "/", httpOnly: false };

/** 登录：从数据库验证密码，更新Cookie，设置或更新Cookie，错误则不管Cookie（反正不是logout） */
router.post('/login', (req, res, next) => {
    try {
        let { code, modify_pwd } = req.body;
        if (!code || !modify_pwd) { ApiTools.errorNeedParams(res); return; }
        dbService.getUploadInfo(code).then((result) => {
            if (!result) { ApiTools.errorWrongCode(res); return; }
            else if (result.modify_pwd != modify_pwd) {
                ApiTools.errorMessage(res, '密码错误😐'); return;
            } else {
                let token = tokenService.genToken(code, modify_pwd);
                res.cookie("modify_token", token, tokenOptions)
                ApiTools.okLoginSuccess(res)
            }
        }).catch((err) => {
            ApiTools.errorMessage(res, err)
        });
    } catch (e) {
        console.log(e)
        ApiTools.errorMessage(res, e);
    }
})

/** 修改编辑密码：从数据库验证密码，若旧密码正确，更新数据库，更新Cookie */
router.post('/changepwd', (req, res, next) => {
    let { code, old_pwd, new_pwd } = req.body;
    if (!code || old_pwd == undefined || !new_pwd) { ApiTools.errorNeedParams(res); return; }
    dbService.getUploadInfo(code).then((result) => {
        if (!result) { ApiTools.errorWrongCode(res); return; }
        else if (result.modify_pwd != old_pwd) {
            ApiTools.errorWrongPwd(res); return;
        } else {
            dbService.changeModifyPwd(code, new_pwd).then((result) => {
                res.send(new ReqBody(1, result))
            }).catch((err) => {
                ApiTools.errorMessage(res, err)
            });
        }
    }).catch((err) => {
        ApiTools.errorMessage(res, err)
    });
})

router.post('/access', (req, res, next) => {
    try {
        let { code, access_pwd } = req.body;
        if (!code || !access_pwd) { ApiTools.errorNeedParams(res); return; }
        dbService.getUploadInfo(code).then((result) => {
            if (!result) { ApiTools.errorWrongCode(res); return; }
            else if (result.access_pwd != access_pwd) {
                ApiTools.errorWrongPwd(res); return;
            } else {
                let token = tokenService.genToken(code, access_pwd);
                res.cookie(AccessTokenName, token, tokenOptions)
                ApiTools.okLoginSuccess(res)
            }
        }).catch((err) => {
            res.send(new ReqBody(0, null, err))
        });
    } catch (e) {
        console.log(e)
        ApiTools.errorMessage(res, e)
    }
})

router.post('/changeaccesspwd', (req, res, next) => {
    let { code, new_pwd } = req.body;
    if (!code) { ApiTools.errorNeedParams(res) }
    dbService.changeAccessPwd(code, new_pwd).then((result) => {
        res.send(new ReqBody(1, result))
    }).catch((err) => {
        res.send(new ReqBody(0, null, err))
    });
})

module.exports = router;