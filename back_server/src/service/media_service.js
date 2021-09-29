const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * 
 * @param {string} input 输入文件的绝对路径
 * @param {string} output 输出文件的绝对路径（.mp4结尾）
 * @returns 
 */
module.exports.videoToMp4 = function (input, output) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(input)
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioQuality(0)
            .save(output)
            .on('end', function (stdout, stderr) {
                console.log('ffmpeg finish work!')
                resolve(true)
            }).on('error', function (err, stdout, stderr) {
                console.log('[ERROR] Cannot process video: ' + err.message);
                reject(err.message)
            })
    })
}

/**
 * 
 * @param {string} input 输入文件的绝对路径
 * @param {string} output 输出文件的绝对路径（.m4a结尾）
 * @returns 
 */
module.exports.audioToM4a = function (input, output) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(input)
            .audioCodec('aac')
            .audioQuality(0)
            .save(output)
            .on('end', function (stdout, stderr) {
                console.log('ffmpeg finish work!')
                resolve(true)
            }).on('error', function (err, stdout, stderr) {
                console.log('[ERROR] Cannot process audio: ' + err.message);
                reject(err.message)
            })
    })
}