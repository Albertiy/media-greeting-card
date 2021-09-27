import { LinearProgress } from '@material-ui/core';
import { mdiCamera, mdiCheckBold, mdiDownload, mdiPlay, mdiRefresh, mdiStop, mdiVideoOutline } from '@mdi/js';
import Icon from "@mdi/react";
import dayjs from 'dayjs';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from "react";
import AlertDialog from "../src/component/alert-dialog";
import ModelLoading from "../src/component/model_loading";
import TitleBar from "../src/component/title_bar";
import Uploadfiles from '../src/model/uploadfiles';
import * as FileService from '../src/service/file_service';
import * as Tools from "../src/tool/tools";
import styles from '../styles/recordvideo.module.scss';

const RecordBtnStateEnum = {
    START: { title: '录制', icon: mdiCamera },
    STOP: { title: '停止', icon: mdiStop },
    RETAKE: { title: '重录', icon: mdiRefresh }
}

const defaultRouterLoaded = false;
/** @type{string} */
const defaultCode = null;
/** @type{Uploadfiles} */
const defaultUploadInfo = null;

const defaultLoading = false;
const defaultDialog = { open: false, title: '提示', content: '确认' };

/** @type{MediaStream} */
const defaultMediaStream = null;
const defaultRecordBtnState = RecordBtnStateEnum.START;
const defaultShowVideo = false;
const defaultTimeCount = 0;
const defaultTimerId = -1;
/** @type { MediaRecorder } */
const defaultMediaRecorder = null;
const mediaRecorderOptions = {
    mimeType: "video/mp4",
    // audioBitsPerSecond: 128000,
    // videoBitsPerSecond: 2500000,
}
const MAX_RECORD_DURATION = 20; // 20s 最大录制时长
const defaultFileURL = '';
/** @type {File} */
const defaultVideoFile = null;
const FILE_NAME = 'greeting';

/** 视频MIME类型列表 */
const videoMimeList = [
    {
        mime: '.webm',
        mimeType: 'video/webm; codecs="vp8, opus"', // codecs=vp9 vp9 依赖于硬件解码。
        fileMime: 'video/webm',
    },
    { // H.264 + ER AAC LC ，理应是最兼容的格式
        mime: '.mp4',
        mimeType: 'video/mp4; codecs="avc1.4d002a, mp4a.40.2"', // avc1.424028
        fileMime: 'video/mp4',
    },
];
let selectedMime = videoMimeList[0];

const defaultProgressValue = 0;
const defaultWaitForUpload = false;

/**
 * Ref模仿State的回调函数
 * @callback setRefCallback
 * @param {*} value
 * @returns {*}
 */

function RecordVideoPage() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(defaultCode);
    const [uploadInfo, setUploadInfo] = useState(defaultUploadInfo);

    /** @type {{current: HTMLVideoElement}} */
    const videoEle = useRef(null);

    const [loading, setLoading] = useState(defaultLoading);
    const [showDialog, setShowDialog] = useState(defaultDialog.open);
    const [dialogTitle, setDialogTitle] = useState(defaultDialog.title);
    const [dialogContent, setDialogContent] = useState(defaultDialog.content);
    let defaultHandleClose = function (ok) { setShowDialog(false) };
    const [dialogHandleClose, setDialogHandleClose] = useState(defaultHandleClose);

    const [mediaStream, setMediaStream] = useState(defaultMediaStream);
    const [recordBtnState, setRecordBtnState] = useState(defaultRecordBtnState);
    const [showVideo, setShowVideo] = useState(defaultShowVideo);

    const [timeCount, setTimeCount] = useState(defaultTimeCount); // 用来渲染的值，不适用 useRef
    const timeCountRef = useRef(defaultTimeCount);

    const startTime = useRef(dayjs());
    const timerIdRef = useRef(defaultTimerId);
    /** @param {number|setRefCallback} value */
    const setTimerId = (value) => {
        if (typeof value == 'function')
            timerIdRef.current = value(timerIdRef.current)
        else
            timerIdRef.current = value
    }
    const mediaRecorder = useRef(defaultMediaRecorder);
    /** @param {MediaRecorder|setRefCallback} value */
    const setMediaRecorder = (value) => {
        if (typeof value == 'function')
            mediaRecorder.current = value(mediaRecorder.current)
        else
            mediaRecorder.current = value
    }

    const [fileURL, setFileURL] = useState(defaultFileURL);
    const [videoFile, setVideoFile] = useState(defaultVideoFile);

    const [progressValue, setProgressValue] = useState(defaultProgressValue);
    const [waitForUpload, setWaitForUpload] = useState(defaultWaitForUpload);

    useEffect(() => {
        console.log('第' + (routerRefreshCount.current + 1) + '次路由刷新')
        let params = router.query;
        console.log('params: %o', params)
        if (params && params.code) {
            let code = params.code;
            enqueueSnackbar('code: ' + code, { variant: 'info', autoHideDuration: 1000 })
            setCode(code);
            getInfoByCode(code);
        }

        if (routerRefreshCount.current > 0) setRouterLoaded(true);
        routerRefreshCount.current += 1;

    }, [router.query])

    /**
     * 加载现有数据
     * @param {string} code 
     */
    function getInfoByCode(code) {
        // 判断code加载数据
        FileService.getUploadInfo(code).then((result) => {
            console.log('结果：%o', result);
            setUploadInfo(result);
            if (result.videoPath) {
                initRemoteVideo(FileService.getFile(result.videoPath));
            } else {
                console.log('当前尚未上传过视频文件')
            }
        }).catch((err) => { // 说明code无效，此时UploadInfo为空
            enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
        });
    }

    /**
     * 当加载到远程已有的文件url，将其设置为播放器的源
     * @param {string} remoteUrl 
     */
    function initRemoteVideo(remoteUrl) {
        setRecordBtnState(RecordBtnStateEnum.RETAKE);
        setVideoSource(remoteUrl);
        setShowVideo(true);
    }

    useEffect(() => {
        testRecorderType();
        initMediaSource();
    }, []);

    /** 测试当前设备MediaRecorder可用的类型 */
    function testRecorderType() {
        for (let i = 0; i < videoMimeList.length; i++) {
            let ok = MediaRecorder.isTypeSupported(videoMimeList[i].mimeType);
            console.log(`${videoMimeList[i].mimeType} : ${ok}`)
            if (ok) {
                mediaRecorderOptions.mimeType = videoMimeList[i].mimeType;
                selectedMime = videoMimeList[i];
                break;
            }
        }
    }

    /**
     * 初始化媒体源和录制功能
     */
    function initMediaSource() {
        let constraints = {
            audio: true,
            // {
            //     noiseSuppression: true,
            //     echoCancellation: true
            // },
            video: { width: 800, height: 800 }
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                // alert('success get media stream')
                enqueueSnackbar('成功获取媒体源', { variant: 'success', autoHideDuration: 850 })
                setMediaStream(stream);
                if (!videoEle.current.src) // 若当前video元素已显示，说明加载了远程视频源
                    setVideoSource(stream);
            })
            .catch(function (err) {
                // alert('fail to get media stream: ' + err.toString());
                console.log(err.name + ": " + err.message);
                if (err.name == 'NotFoundError')
                    enqueueSnackbar('当前设备缺少麦克风或摄像头', { variant: 'error', autoHideDuration: 10000 })
                else if (err.name == 'NotAllowedError')
                    enqueueSnackbar('请授权当前页面录音与录像权限', { variant: 'error', autoHideDuration: 2000 })
                else if (err.name == 'NotReadableError')
                    enqueueSnackbar('摄像头与麦克风可能被其他应用占用，请更换浏览器', { variant: 'error', autoHideDuration: 10000 })
                else {
                    enqueueSnackbar('' + err.name, { variant: 'error', autoHideDuration: 10000 })
                }
            }).finally(function () {
                // alert('get media stream done!')
            })
    }

    /**
     * 设置video媒体源
     * @param {MediaStream | string} stream 
     */
    function setVideoSource(stream) {
        console.log('videoSource: %o', stream);
        let video = videoEle.current;
        video.oncanplay = () => {
            if (video.src && !video.srcObject) {
                enqueueSnackbar('视频时长：' + video.duration + '秒', { variant: 'info', autoHideDuration: 1000 });
            }
        }
        if (video) {
            if (stream instanceof MediaStream) {
                if ('srcObject' in video) {
                    video.srcObject = stream;
                } else {
                    console.log('浏览器不支持srcObject，使用src和url')
                    video.src = URL.createObjectURL(stream)
                }
            } else if (stream) {
                video.srcObject = null;
                video.src = stream;
            } else {
                video.src = defaultFileURL;
                console.log('null video source')
            }
        } else {
            console.log('video 元素尚未加载')
        }
    }

    /**
     * 计时累加器
     */
    function updateTime() {
        let tick = dayjs().diff(startTime.current, 'seconds');
        setTimeCount(value => { timeCountRef.current = tick; return tick });
        console.log('tick: ' + tick);   // timeCount 竟然一直是0，看来是代码复制的问题
        if (tick >= MAX_RECORD_DURATION) recordStop();
    }

    /**
     * 开始录制
     */
    function recordStart() {
        setVideoSource(mediaStream);   // 重置video媒体源为mediaStream
        setShowVideo(true);
        let video = videoEle.current;
        if (video) {
            // 初始化计时器
            setTimeCount(value => { timeCountRef.current = defaultTimeCount; return defaultTimeCount });
            startTime.current = new Date();   // 这里不能用 dayjs()

            video.play();
            //录制开始
            recording();
            setRecordBtnState(RecordBtnStateEnum.STOP);
            // 计时器启动
            let id = setInterval(updateTime, 1000);
            console.log('计时器启动：id = ' + id)
            setTimerId(id);
        } else {
            enqueueSnackbar('video元素ref为空', { variant: 'warning', autoHideDuration: 1000 })
        }
    }

    /**
     * 初始化录制器，包括录制结束时的回调函数
     */
    function initMediaRecorder() {
        let recorder = new MediaRecorder(mediaStream, mediaRecorderOptions);
        recorder.ondataavailable = function (event) {
            console.log('video data available')
            let chunks = [];
            if (event.data.size > 0) {
                chunks.push(event.data);
                console.log(event.data);
                generateSrcUrl(chunks).then((url) => {
                    setFileURL(url);
                    setVideoSource(url);
                }).catch((err) => {
                    console.log(err)
                })
            } else {
                console.log('no data!')
            }
        };
        setMediaRecorder(recorder);
        return recorder;
    }

    /**
     * 开始录制
     */
    function recording() {
        if (mediaStream) {
            let recorder = mediaRecorder.current ? mediaRecorder.current : initMediaRecorder();
            recorder.start();
            enqueueSnackbar('开始录制', { variant: 'info', autoHideDuration: 1000 })
            setWaitForUpload(true)
        } else {
            enqueueSnackbar('无效的媒体源，无法录制!', { variant: 'error', autoHideDuration: 2000 })
        }
    }

    /**
     * 录制停止
     */
    function recordStop() {
        let video = videoEle.current;
        console.log('timerId: %o, timeCount: %o, startTime: %o', timerIdRef.current, timeCountRef.current, startTime.current);
        if (video && timerIdRef.current != defaultTimerId) {
            console.log('停止计时')
            video.pause();
            if (mediaRecorder.current) {
                mediaRecorder.current.stop();
            }
            setRecordBtnState(RecordBtnStateEnum.RETAKE);
            clearInterval(timerIdRef.current);
        }
    }

    /**
     * 获取文件URL，改为异步
     * @param {Blob[]} chunks 
     * @returns {Promise<string>} 本地URL
     */
    function generateSrcUrl(chunks) {
        return new Promise((resolve, reject) => {
            // TODO 文件缺少时长元数据，目前尚无办法解决
            let file = new File(chunks, FILE_NAME + selectedMime.mime, { type: selectedMime.fileMime });
            console.log('Gened File: %o', file);
            setVideoFile(file); // 用来上传的文件
            resolve(getObjectUrl(file));
        })
    }

    /**
     * 获取文件URL
     * @param {File} file 
     * @returns 
     */
    function getObjectUrl(file) {
        let fileInfo = `类型：${file.type}，大小：${Tools.returnFileSize(file.size)}`;
        console.log(fileInfo);
        enqueueSnackbar('录制成功！' + fileInfo, { variant: 'success', autoHideDuration: 3000 })
        let url = URL.createObjectURL(file);
        console.log('url: ' + url);
        return url;
    }

    /**
     * 点击录制按钮（图片按钮）
     * @param {*} ev 
     */
    function recordBtnClicked(ev) {
        enqueueSnackbar('显示video元素', { variant: 'info', autoHideDuration: 1000 })
        recordStart();
    }

    /**
     * 关闭重录对话框
     * @param {boolean} ok 
     */
    let handleReTakeOk = function (ok) {
        console.log('result: ' + ok)
        if (ok) {
            recordStart(); // 重录
        }
        setShowDialog(false)
    }

    /**
     * 点击重录
     * @param {*} ev 
     */
    function reTakeBtnClicked(ev) {
        switch (recordBtnState) {
            case (RecordBtnStateEnum.START): {
                console.log('点击了开始录制按钮')
                recordStart();
            }; break;
            case (RecordBtnStateEnum.STOP): {
                console.log('点击了停止录制按钮')
                // 停止录制，保存为 Blob 或 File 
                recordStop();
            }; break;
            case (RecordBtnStateEnum.RETAKE): {
                console.log('点击了重新录制按钮')
                // 弹窗提示，是否确定要重新录制
                showAlertDialog('警告', '将清除原先录制的内容，确定要重新录制吗？', handleReTakeOk);
            }; break;
        }
    }

    /**
     * 点击下载
     */
    function downloadBtnClicked() {
        if (recordBtnState == RecordBtnStateEnum.RETAKE && fileURL) {
            if ("Safari" == Tools.myBrowser()) {
                console.log('Safari，弹窗')
                enqueueSnackbar('iphone无法直接下载，请使用电脑或安卓设备打开链接', { variant: 'info', autoHideDuration: 3000 })
                showAlertDialog('请复制文件网址并到电脑端浏览器打开以下载', <input readOnly style={{ width: '100%' }} value={fileURL}></input>)
            } else {
                console.log('非 Safari，直接下载')
                const a = document.createElement('a');
                a.style.display = 'none';
                a.download = FILE_NAME + selectedMime.mime;
                a.href = fileURL;
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            }
        } else {
            console.log('文件不存在，未下载')
            enqueueSnackbar('文件不存在，未下载', { variant: 'warning', autoHideDuration: 2000 })
        }
    }

    /**
     * 点击预览
     * @param {Event} ev 
     */
    function previewBtnClicked(ev) {
        //// 此按钮最好去掉，或者换成播放页面内媒体
        if (uploadInfo.videoPath) {
            if (waitForUpload) {
                showAlertDialog('提示', '当前新录制的文件尚未上传，是否确认放弃内容进入预览页？可先点击完成按钮，上传内容', (ok) => {
                    if (ok) { router.push({ pathname: '/watchvideo', query: { code: code } }); setShowDialog(false) }
                    else { setShowDialog(false) }
                })
            } else {
                router.push({ pathname: '/watchvideo', query: { code: code } }); setShowDialog(false)
            }
        } else {
            enqueueSnackbar('尚未上传音频内容，请先录制并上传', { variant: 'warning', autoHideDuration: 2000 })
        }
    }

    /**
     * 点击完成
     */
    function finishBtnClicked() {
        if (recordBtnState == RecordBtnStateEnum.RETAKE && videoFile != null) {
            if (!waitForUpload) {
                enqueueSnackbar('当前录制文件已上传，无需重复上传！', { variant: 'warning', autoHideDuration: 2000 });
                return;
            }
            // 上传视频，并弹窗提示
            setLoading(true);
            enqueueSnackbar('待上传的文件:' + Tools.returnFileSize(videoFile.size), { variant: 'info', autoHideDuration: 2000 });
            FileService.uploadGreetings(code, videoFile, null, progressUpload).then((result) => {
                setProgressValue(1);
                showAlertDialog('提示', '文件上传成功！')
                getInfoByCode(code);
                setWaitForUpload(false);
            }).catch((err) => {
                console.log(err)
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
                setProgressValue(defaultProgressValue);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            enqueueSnackbar('尚未录制，或等待或者点击停止按钮以结束当前录制', { variant: 'warning', autoHideDuration: 1000 })
        }
    }

    /**
     * axios 进度回调函数
     * @param {*} progressEvent 
     */
    function progressUpload(progressEvent) {
        console.log(progressEvent);
        try {
            let now = progressEvent.loaded / progressEvent.total;
            now = now > 1 ? 1 : now;
            now = now < 0 ? 0 : now;
            setProgressValue(now);
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 显示弹窗
     * @param {string} title 
     * @param {string} content 
     * @param {function} [handleClose] 
     */
    function showAlertDialog(title, content, handleClose) {
        // console.log(title)
        // console.log(content)
        // console.log(handleClose)

        setDialogTitle(value => title || defaultDialog.title)
        setDialogContent(value => content || defaultDialog.content)
        setDialogHandleClose(value => handleClose || defaultHandleClose)
        setShowDialog(true)

        // console.log(dialogTitle)
        // console.log(dialogContent)
        // console.log(dialogHandleClose)

    }

    return (
        <div className={styles.container}>
            <Head>
                <title>摄影棚</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='摄影棚'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <video className={styles.video} ref={videoEle} controls={true} style={showVideo ? {} : { display: 'none' }} playsInline={true} webkit-playsinline="true"></video>
                    <div onClick={recordBtnClicked} style={showVideo ? { display: 'none' } : {}}>
                        <div>
                            <Icon className={styles.cover_icon} path={mdiVideoOutline} />
                        </div>
                        <div>点击录制视频</div>
                    </div>
                    {/* <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img> */}
                </div>
                <div className={styles.btn_panel}>
                    <div className={styles.btn}>
                        <div className={styles.icon} onClick={previewBtnClicked}>
                            <Icon path={mdiPlay} size={1} /></div>
                        <div>预览</div>
                    </div>
                    <div className={styles.btn}>
                        <div className={styles.icon} onClick={reTakeBtnClicked}>
                            <Icon path={recordBtnState.icon} size={1} /></div>
                        <div>{recordBtnState.title}</div>
                    </div>
                    <div className={styles.btn}>
                        <div className={styles.icon} onClick={finishBtnClicked}>
                            <Icon path={mdiCheckBold} size={1} /></div>
                        <div>完成</div>
                    </div>
                </div>
                <div className={styles.info}>
                    <div>时长：{Tools.formatDuration(timeCount) + '/' + Tools.formatDuration(MAX_RECORD_DURATION)}</div>
                </div>
                <div className={styles.float_bar}>
                    {fileURL && <div className={styles.float_download} title="下载" onClick={downloadBtnClicked}>
                        <Icon path={mdiDownload} size={1}></Icon>
                    </div>}
                </div>
            </main>
            <footer>
            </footer>
            <AlertDialog open={showDialog} title={dialogTitle} content={dialogContent} handleClose={dialogHandleClose} />
            {loading && <ModelLoading>
                <LinearProgress variant="determinate" value={progressValue * 100} style={{ width: "80%", margin: "60px 0 20px" }} />
                <span style={{ color: '#fff' }}>{(progressValue * 100).toFixed(2) + '%'}</span>
                <p style={{ color: '#CCFFFF', marginTop: "40px" }}>请注意：
                    <br />上传过程中请不要隐藏或关闭页面，
                    <br />否则上传将中断</p>
            </ModelLoading>}
        </div>
    )
}
export default RecordVideoPage;