const ReqBody = require("../../src/model/req_body")

/**
 * 返回成功响应信息
 * @param {Response} res 
 * @param {string} msg 
 */
const okMessage = function (res, msg) {
    res.send(new ReqBody(1, msg));
}

const okLoginSuccess = function (res) {
    okMessage(res, '登录成功😀');
}

/**
 * 返回错误响应信息
 * @param {Response} res 
 * @param {string} msg 
 */
const errorMessage = function (res, msg) {
    res.send(new ReqBody(0, null, msg));
}

/**
 * 返回错误响应“缺少必要参数”
 * @param {Response} res 
 */
const errorNeedParams = function (res) {
    errorMessage(res, '缺少必要参数');
}

/**
 * 返回错误响应“code不存在”
 * @param {Response} res 
 * @returns 
 */
const errorWrongCode = function (res) {
    errorMessage(res, 'code不存在');
}

/**
 * 返回错误响应“密码错误”
 * @param {Response} res 
 */
const errorWrongPwd = function (res) {
    errorMessage(res, '密码错误😐');
}

module.exports = {
    okMessage,
    okLoginSuccess,
    errorMessage,
    errorNeedParams,
    errorWrongCode,
    errorWrongPwd,
}