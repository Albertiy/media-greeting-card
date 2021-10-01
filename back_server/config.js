const fs = require('fs');

/**
 * 获取 application.config.json
 * @returns {{
 * port: number,
 * env: string,
 * staticPath: string,
 * frontAddress: string, 
 * logDirectory: string,
 * fileRoot: string,
 * exampleMode: boolean,
 * tokenSecret: string,
 * tokenExpires: number,
 * qrEntryUrl: string,
 * videoFileRoot: string,
 * audioFileRoot: string,
 * qrFileRoot: string,
 * ffmpegRoot: string,
 * }}
 */
exports.application = function () {
    try {
        return JSON.parse(fs.readFileSync('./config/application.config.json'));
    } catch (_) {
        return {};
    }
}

/**
 * 获取 database.config.json
 * @returns {{
 *  host: string,
 *  port: string,
 *  user: string,
 *  password: string,
 *  database: string,
 * }}
 */
exports.database = function () {
    try {
        return JSON.parse(fs.readFileSync('./config/database.config.json'));
    } catch (_) {
        return {};
    }
}