import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordaudio.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiMicrophone, mdiStop, mdiRefresh, mdiDownload } from '@mdi/js';
import { useSnackbar } from 'notistack';
import AlertDialog from "../src/component/alert-dialog";
import ModelLoading from "../src/component/model_loading";
import { LinearProgress } from '@material-ui/core';
import dayjs from 'dayjs';
import * as Tools from "../src/tool/tools";
import * as FileService from '../src/service/file_service';

const RecordBtnStateEnum = {
    START: { title: '录制', icon: mdiMicrophone },
    STOP: { title: '停止', icon: mdiStop },
    RETAKE: { title: '重录', icon: mdiRefresh }
}

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
const MAX_RECORD_DURATION = 30; // 30s 最大录制时长
const defaultFileURL = '';
/** @type {File} */
const defualtAudioFile = null;
const FILE_NAME = 'greeting';

/** 音频MIME类型列表 */
const audioMimeList = [
    {
        mime: '.ogg',
        mimeType: 'audio/ogg;codecs=opus',
        fileMime: 'audio/ogg',
    },
    {
        mime: '.webm',
        mimeType: 'audio/webm;codecs=opus', // codecs=vp9 vp9 依赖于硬件解码。
        fileMime: 'audio/webm',
    },
    {
        mime: '.mp3',
        mimeType: 'audio/mpeg;codecs=mp4a.40.2"',
        fileMime: 'audio/mpeg',
    },
    {
        mime: '.wav',
        mimeType: 'audio/wav',
        fileMime: 'audio/wav',
    }, {
        mime: '.aac',
        mimeType: 'audio/aac',
        fileMime: 'audio/aac',
    }
];
let selectedMime = audioMimeList[0];
const defaultProgressValue = 0;

function RecordAudio() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
    const startTime = useRef(dayjs());
    const [timerId, setTimerId] = useState(defaultTimerId);

    const [mediaRecorder, setMediaRecorder] = useState(defaultMediaRecorder);
    const [fileURL, setFileURL] = useState(defaultFileURL);
    const [audioFile, setAudioFile] = useState(defualtAudioFile);

    const [progressValue, setProgressValue] = useState(defaultProgressValue);

    useEffect(() => {
        testRecorderType();
        initMediaSource();
    }, []);

    /** 测试当前设备MediaRecorder可用的类型 */
    function testRecorderType() {
        for (let i = 0; i < audioMimeList.length; i++) {
            let ok = MediaRecorder.isTypeSupported(audioMimeList[i].mimeType);
            alert(`${audioMimeList[i].mimeType} : ${ok}`)
            if (ok) {
                mediaRecorderOptions.mimeType = audioMimeList[i].mimeType;
                selectedMime = audioMimeList[i];
                // break;
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
                enqueueSnackbar('stream: ' + stream.toString(), { variant: 'success', autoHideDuration: 6000 })
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
     * 
     * @param {MediaStream | string} stream 
     */
    function setAudioSource(stream) {
        console.log('audioSource: %o', stream);
        let audio = audioEle.current;
        audio.oncanplay = () => {
            enqueueSnackbar('音频时长：' + audio.duration + '秒', { variant: 'info', autoHideDuration: 1000 });
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
            console.log('video 元素尚未加载')
        }
    }

    /**
     * 计时累加器
     */
    function updateTime() {
        let tick = dayjs().diff(startTime.current, 'seconds');
        setTimeCount(tick);
        console.log('tick: ' + tick);   // timeCount 竟然一直是0，看来是代码复制的问题
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
            setTimeCount(defaultTimeCount);
            startTime.current = new Date();   // 这里不能用 dayjs()

            audio.play();
            // 录制开始
            recording();
            setRecordBtnState(RecordBtnStateEnum.STOP);
            // 计时器启动
            setTimerId(setInterval(updateTime, 1000));
        } else {
            enqueueSnackbar('audio元素ref为空')
        }
    }

    /**
     * 初始化录制器
     */
    function initMediaRecorder() {
        let recorder = new MediaRecorder(mediaStream, mediaRecorderOptions);
        recorder.ondataavailable = function (event) {
            console.log('audio data available')
            let chunks = [];
            if (event.data.size > 0) {
                chunks.push(event.data);
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
            let recorder = mediaRecorder ? mediaRecorder : initMediaRecorder();
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
        console.log('timerId: %o, timeCount: %o, startTime: %o', timerId, timeCount, startTime.current);
        if (audio && timerId != defaultTimerId) {
            audio.pause();
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            setRecordBtnState(RecordBtnStateEnum.RETAKE);
            clearInterval(timerId);
        }
    }

    /**
     * 生成文件，返回URL
     * @param {Blob[]} chunks 
     * @returns {string} 本地URL
     */
    function generateSrcUrl(chunks) {
        return new Promise((resolve, reject) => {
            let blob = new Blob(chunks, { type: selectedMime.fileMime });
            let file = new File([blob], FILE_NAME + selectedMime.mime, { type: selectedMime.fileMime });
            file.duration = 13;
            blob.duration = 13;
            setAudioFile(file); // 用来上传的文件
            resolve(getBlobUrl(blob));
        })
    }

    /**
     * 获取文件Blob URL
     * @param {Blob} blob 
     * @returns 
     */
    function getBlobUrl(blob) {
        let fileInfo = `类型：${blob.type}，大小：${Tools.returnFileSize(blob.size)}`;
        console.log(fileInfo);
        enqueueSnackbar('录制成功！' + fileInfo, { variant: 'success', autoHideDuration: 3000 })
        let url = URL.createObjectURL(blob);
        console.log('url: ' + url);
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
        enqueueSnackbar('跳转到预览', { variant: 'info', autoHideDuration: 2000 })
    }

    /**
     * 点击完成
     */
    function finishBtnClicked() {

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
        console.log(title)
        console.log(content)
        console.log(handleClose)

        setDialogTitle(value => title || defaultDialog.title)
        setDialogContent(value => content || defaultDialog.content)
        setDialogHandleClose(value => handleClose || defaultHandleClose)
        setShowDialog(true)

        console.log(dialogTitle)
        console.log(dialogContent)
        console.log(dialogHandleClose)
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
                    <div>时长：{Tools.formatDuration(timeCount)}</div>
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
                <LinearProgress variant="determinate" value={progressValue * 100} style={{ width: "80%", margin: "20px 0 20px" }} />
                <span style={{ color: '#fff' }}>{(progressValue * 100).toFixed(2) + '%'}</span>
            </ModelLoading>}
        </div>
    )
}
export default RecordAudio;