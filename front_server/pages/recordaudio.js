import { LinearProgress } from '@material-ui/core';
import { mdiCheckBold, mdiDownload, mdiMicrophone, mdiPlay, mdiRefresh, mdiStop } from '@mdi/js';
import Icon from "@mdi/react";
import dayjs from 'dayjs';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from "react";
import AlertDialog from "../src/component/alert-dialog";
import ModelLoading from "../src/component/model_loading";
import TitleBar from "../src/component/title_bar";
import * as FileService from '../src/service/file_service';
import * as Tools from "../src/tool/tools";
import styles from '../styles/recordaudio.module.scss';

const RecordBtnStateEnum = {
    START: { title: '录制', icon: mdiMicrophone },
    STOP: { title: '停止', icon: mdiStop },
    RETAKE: { title: '重录', icon: mdiRefresh }
}

const defaultRouterLoaded = false;
const defaultCode = null;
/** @type{Uploadfiles} */
const defaultUploadInfo = null;

const defaultLoading = false;
const defaultDialog = { open: false, title: '提示', content: '确认' };

/** @type{MediaStream} */
const defaultMediaStream = null;
const defaultRecordBtnState = RecordBtnStateEnum.START;
const defaultShowAudio = false;
const defaultTimeCount = 0;
const defaultTimerId = -1;
/** @type { MediaRecorder } */
const defaultMediaRecorder = null;
const mediaRecorderOptions = {
    mimeType: "audio/mpeg",
    // audioBitsPerSecond: 128000,
    // videoBitsPerSecond: 2500000,
}
const MAX_RECORD_DURATION = 60; // 60s 最大录制时长
const defaultFileURL = '';
/** @type {File} */
const defualtAudioFile = null;
const FILE_NAME = 'greeting';

/** 音频MIME类型列表 */
const audioMimeList = [
    {
        mime: '.webm',
        mimeType: 'audio/webm;codecs=opus', // codecs=vp9 vp9 依赖于硬件解码。
        fileMime: 'audio/webm',
    },
    {
        mime: '.mp3',
        mimeType: 'audio/mp4',  //;codecs=mp4a.40.2
        fileMime: 'audio/mp4',
    },
];
let selectedMime = audioMimeList[0];

const defaultProgressValue = 0;

/**
 * Ref模仿State的回调函数
 * @callback setRefCallback
 * @param {*} value
 * @returns {*}
 */

function RecordAudioPage() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);
    const [uploadInfo, setUploadInfo] = useState(defaultUploadInfo);

    /** @type {{current: HTMLAudioElement}} */
    const audioEle = useRef(null);

    const [loading, setLoading] = useState(defaultLoading);
    const [showDialog, setShowDialog] = useState(defaultDialog.open);
    const [dialogTitle, setDialogTitle] = useState(defaultDialog.title);
    const [dialogContent, setDialogContent] = useState(defaultDialog.content);
    let defaultHandleClose = function (ok) { setShowDialog(false) };
    const [dialogHandleClose, setDialogHandleClose] = useState(defaultHandleClose);

    const [mediaStream, setMediaStream] = useState(defaultMediaStream);
    const [recordBtnState, setRecordBtnState] = useState(defaultRecordBtnState);
    const [showAudio, setShowAudio] = useState(defaultShowAudio);

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
    const [audioFile, setAudioFile] = useState(defualtAudioFile);

    const [progressValue, setProgressValue] = useState(defaultProgressValue);

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
        return () => {
            if (routerRefreshCount.current > 0) setRouterLoaded(true);
            routerRefreshCount.current += 1;
        }
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
            if (result.audioPath) {
                initRemoteAudio(FileService.getFile(result.audioPath));
            }
        }).catch((err) => { // 说明code无效，此时UploadInfo为空
            enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
        });
    }

    /**
     * 当加载到远程已有的文件url，将其设置为播放器的源
     * @param {string} remoteUrl 
     */
    function initRemoteAudio(remoteUrl) {
        setRecordBtnState(RecordBtnStateEnum.RETAKE);
        setAudioSource(remoteUrl);
    }

    useEffect(() => {
        testRecorderType();
        initMediaSource();
    }, []);

    /** 测试当前设备MediaRecorder可用的类型 */
    function testRecorderType() {
        for (let i = 0; i < audioMimeList.length; i++) {
            let ok = MediaRecorder.isTypeSupported(audioMimeList[i].mimeType);
            console.log(`${audioMimeList[i].mimeType} : ${ok}`)
            if (ok) {
                mediaRecorderOptions.mimeType = audioMimeList[i].mimeType;
                selectedMime = audioMimeList[i];
                break;
            }
        }
    }

    /**
     * 初始化媒体源和录制功能
     */
    function initMediaSource() {
        let constraints = {
            audio: {
                noiseSuppression: true,
                echoCancellation: true
            }
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                // alert('success get media stream')
                // stream:+ stream.toString()
                enqueueSnackbar('成功获取媒体源', { variant: 'success', autoHideDuration: 850 })
                setMediaStream(stream);
                setAudioSource(stream);
            })
            .catch(function (err) {
                // alert('fail to get media stream: ' + err.toString());
                console.log(err.name + ": " + err.message);
                if (err.name == 'NotFoundError')
                    enqueueSnackbar('当前设备缺少麦克风', { variant: 'error', autoHideDuration: 10000 })
                else if (err.name == 'NotAllowedError')
                    enqueueSnackbar('请授权当前页面录音权限', { variant: 'error', autoHideDuration: 2000 })
                else if (err.name == 'NotReadableError')
                    enqueueSnackbar('麦克风可能被其他应用占用，请更换浏览器', { variant: 'error', autoHideDuration: 2000 })
                else {
                    enqueueSnackbar('' + err.name, { variant: 'error', autoHideDuration: 10000 })
                }
            }).finally(function () {
                // alert('get media stream done!')
            })
    }

    /**
     * 设置audio媒体源
     * @param {MediaStream | string} stream 流或者文件URL
     */
    function setAudioSource(stream) {
        console.log('audioSource: %o', stream);
        let audio = audioEle.current;
        audio.oncanplay = () => {
            if (audio.src && !audio.srcObject) {    // audio.srcObject 无需提示时长（总是 Inf）
                console.log('时长：' + audio.duration)
                enqueueSnackbar('音频时长：' + audio.duration + '秒', { variant: 'info', autoHideDuration: 1000 });
            }
        }
        if (audio) {
            if (stream instanceof MediaStream) {
                if ('srcObject' in audio) {
                    audio.srcObject = stream;
                } else {
                    console.log('浏览器不支持srcObject，使用src和url')
                    audio.src = URL.createObjectURL(stream)
                }
            } else if (stream) {
                audio.srcObject = null;
                audio.src = stream;
            } else {
                audio.src = defaultFileURL;
                console.log('null video source')
            }
        } else {
            console.log('audio 元素尚未加载')
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
        setAudioSource(mediaStream);   // 设置媒体源为mediaStream
        setShowAudio(true);
        let audio = audioEle.current;
        if (audio) {
            // 初始化计时器
            setTimeCount(value => { timeCountRef.current = defaultTimeCount; return defaultTimeCount });
            startTime.current = new Date();   // 这里不能用 dayjs()

            audio.play();
            // 录制开始
            recording();
            setRecordBtnState(RecordBtnStateEnum.STOP);
            // 计时器启动
            let id = setInterval(updateTime, 1000);
            console.log('计时器启动：id = ' + id)
            setTimerId(id);
        } else {
            enqueueSnackbar('audio元素ref为空')
        }
    }

    /**
     * 初始化录制器，包括录制结束时的回调函数
     */
    function initMediaRecorder() {
        let recorder = new MediaRecorder(mediaStream, mediaRecorderOptions);
        recorder.ondataavailable = function (event) {
            console.log('audio data available')
            let chunks = [];
            if (event.data.size > 0) {
                chunks.push(event.data);
                console.log(event.data);
                generateSrcUrl(chunks).then((url) => {
                    setFileURL(url);
                    setAudioSource(url);
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
        } else {
            enqueueSnackbar('无效的媒体源，无法录制!', { variant: 'error', autoHideDuration: 2000 })
        }
    }

    /**
     * 录制停止
     */
    function recordStop() {
        let audio = audioEle.current;
        console.log('timerId: %o, timeCount: %o, startTime: %o', timerIdRef.current, timeCountRef.current, startTime.current);
        console.log('audio元素是否存在：%O', audio)
        console.log('当前定时器是否有效：' + timerIdRef.current + ' / ' + defaultTimerId)
        if (audio && timerIdRef.current != defaultTimerId) {
            console.log('停止计时')
            audio.pause();
            console.log('录制器是否有效: %o', mediaRecorder.current);
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
            let file = new File(chunks, FILE_NAME + selectedMime.mime, { type: selectedMime.fileMime });
            console.log('Gened File: %o', file);
            setAudioFile(file); // 用来上传的文件
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
        // let audio = new Audio();
        // audio.addEventListener('loadedmetadata', (ev) => {
        //     console.log('audio.duration: ' + audio.duration);
        // })
        // audio.src = url;
        return url;
    }

    /**
     * 点击了录制按钮
     * @param {*} ev 
     */
    function recordBtnClicked(ev) {
        enqueueSnackbar('显示audio元素', { variant: 'info', autoHideDuration: 1000 })
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
                // 停止录制，保存为 Blob 或 File，并设置为源
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
        // TODO 此按钮最好去掉，或者换成播放页面内媒体
        enqueueSnackbar('跳转到预览', { variant: 'info', autoHideDuration: 2000 })
    }

    /**
     * 点击完成
     */
    function finishBtnClicked() {
        if (recordBtnState == RecordBtnStateEnum.RETAKE && audioFile != null) {
            // 上传音频文件，并弹窗提示
            setLoading(true);
            enqueueSnackbar('待上传的文件:' + audioFile.size, { variant: 'info', autoHideDuration: 2000 });
            FileService.uploadGreetings(code, null, audioFile, progressUpload).then((result) => {
                setProgressValue(1);
                showAlertDialog('提示', '上传成功！')
            }).catch((err) => {
                console.log(err)
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
                setProgressValue(defaultProgressValue);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            enqueueSnackbar('请等待当前录制完成', { variant: 'warning', autoHideDuration: 1000 })
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
                <title>录音棚</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='录音棚'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img>
                </div>
                <div className={styles.audio_block}>
                    <audio className={styles.audio} ref={audioEle} controls={true} style={showAudio ? {} : { display: 'none' }} playsInline={true} webkit-playsinline="true"></audio>
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
export default RecordAudioPage;