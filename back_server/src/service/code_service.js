const { v1: uuidV1 } = require('uuid');
const qr = require('qrcode');
const path = require('path');
const fileService = require('./file_service');
const dayjs = require('dayjs');
const fs = require('fs');
const archiver = require('archiver');

const appConfig = require('../../config').application();
const qrEntryUrl = appConfig.qrEntryUrl;
const qrFileRoot = appConfig.qrFileRoot;

const MAX_GEN = 5000;
const MIN_GEN = 1;


/**
 * 批量生成uuid
 * @param {number} count default:1
 * @returns 
 */
function getBatchCode(count = MIN_GEN) {
    count = count > MAX_GEN ? MAX_GEN : count;
    count = count < MIN_GEN ? MIN_GEN : count;
    let i = 0;
    let batch = [];
    for (i; i < count; i++) {
        batch.push(uuidV1());
    }
    return batch;
}

/**
 * 批量获取url链接
 * @param {Array<{code:string, link:string}>} codes 
 */
function getBatchQrLink(codes) {
    let batch = [];
    codes.forEach(val => {
        batch.push({ link: qrEntryUrl + '?code=' + val, code: val });
    })
    return batch;
}

/**
 * 批量生成二维码图片。
 * 文件名采用从1开始的自增编号，拼接 uuid，不按照数据库的id（可能有间隔）。win10按名称排序无需补0.
 * 文件夹名要加上生成的时间，方便区分。
 * @param {Array<{code:string, link:string}>} links 
 * @returns {Promise<string>} 文件夹相对路径名
 */
function genQrFiles(links) {
    return new Promise((resolve, reject) => {
        if (links && links.length > 0) {
            let promList = [];
            /** 文件夹名：时间_第一个code_总数 */
            let qrDirName = dayjs().format('YYYY-MM-DD-HH-mm-ss') + '_' + links[0].code + '_' + links.length;
            let absQrDirPath = path.resolve(fileService.getFileRoot(), qrFileRoot, qrDirName);
            console.log('qrFilePath: ' + absQrDirPath);
            fileService.mkdirsSync(absQrDirPath);
            links.forEach((ele, idx) => {
                /** 图片文件名：序号_code.jpg */
                let filePath = path.resolve(absQrDirPath, (idx + 1) + '-' + ele.code + '.jpg');
                promList.push(qr.toFile(filePath, ele.link).then((result) => { /*console.log(filePath)*/ }).catch((err) => { console.log(err) }));
            });
            Promise.all(promList).then(val => {
                getArchiver(absQrDirPath).then((res) => {
                    let absZipPath = res;
                    let relativeZipPath = path.relative(path.resolve(fileService.getFileRoot()), absZipPath);
                    console.log('relativeZipPath: ' + relativeZipPath);
                    resolve(relativeZipPath);
                }).catch((err) => {
                    reject(err);
                });
            }).catch(err => {
                console.log('err: %o', err)
                reject(err)
            });
        } else
            reject('没有有效的链接')
    })
}

/**
 * 压缩文件夹
 * @param {string} dirPath 
 * @returns 压缩后的文件路径
 */
function getArchiver(dirPath) {
    return new Promise((resolve, reject) => {
        let zipFilePath = dirPath + '.zip';
        const output = fs.createWriteStream(dirPath + '.zip');
        console.log('output: ' + output);
        const archive = archiver('zip', {
            zlib: { level: 9 }  // 压缩等级
        });
        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve(zipFilePath);
        })
        output.on('end', () => {
            console.log('Data has been drained');
        })
        output.on('warning', (err) => {
            if (err.code === 'ENOENT')
                reject('无效的文件压缩目录')
            else
                reject(err)
        })
        output.on('error', (err) => {
            reject(err);
        })
        archive.pipe(output);
        archive.directory(dirPath, '');
        archive.finalize();
    })
}

module.exports = {
    getBatchCode,
    getBatchQrLink,
    genQrFiles,
    getArchiver,
}