import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordvideo.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiCamera, mdiStop, mdiRefresh, mdiVideoOutline } from '@mdi/js';
import { useSnackbar } from 'notistack';
import AlertDialog from "../src/component/alert-dialog";
import ModelLoading from "../src/component/model_loading";
import * as Tools from "../src/tool/tools";
import dayjs from 'dayjs';

const RecordBtnStateEnum = {
    START: { title: '录制', icon: mdiCamera },
    STOP: { title: '停止', icon: mdiStop },
    RETAKE: { title: '重录', icon: mdiRefresh }
}

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
const mediaRecorderOptions = { mimeType: "video/mp4" }
const MAX_RECORD_DURATION = 10; // 10s 最大录制时长

function RecordVideo() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
    const startTime = useRef(dayjs());
    const [timerId, setTimerId] = useState(defaultTimerId);

    const [mediaRecorder, setMediaRecorder] = useState(defaultMediaRecorder);


    useEffect(() => {
        initMediaSource();
    }, []);

    /**
     * 初始化媒体源和video标签
     */
    function initMediaSource() {
        let constraints = { audio: true, video: { width: 1024, height: 720 } }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                setMediaStream(stream);
                setVideoSource(stream);
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
                if (err.name == 'NotFoundError')
                    enqueueSnackbar('当前设备缺少麦克风或摄像头', { variant: 'error', autoHideDuration: 10000 })
                else if (err.name == 'NotAllowedError')
                    enqueueSnackbar('请授权当前浏览器或应用录音与录像权限', { variant: 'error', autoHideDuration: 2000 })
            })
    }

    /**
     * 
     * @param {MediaStream | string} stream 
     */
    function setVideoSource(stream) {
        let video = videoEle.current;
        if (video) {
            if (stream instanceof MediaStream) {
                if ('srcObject' in video) {
                    video.srcObject = stream;
                } else {
                    console.log('浏览器不支持srcObject，使用src和url')
                    video.src = URL.createObjectURL(stream)
                }
            } else {
                video.src = stream;
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
        setVideoSource(mediaStream);   // 重置video媒体源为mediaStream
        setShowVideo(true);
        let video = videoEle.current;
        if (video) {
            // 初始化计时器
            setTimeCount(defaultTimeCount);
            startTime.current = new Date();   // 这里不能用 dayjs()

            video.play();
            //TODO 录制开始
            recording();
            setRecordBtnState(RecordBtnStateEnum.STOP);
            // TODO 计时器启动
            setTimerId(setInterval(updateTime, 1000));
        } else {
            enqueueSnackbar('video元素ref为空')
        }
    }

    /**
     * 初始化录制器
     */
    function initMediaRecorder() {
        let recorder = new MediaRecorder(mediaStream, mediaRecorderOptions);
        recorder.ondataavailable = function (event) {
            console.log('video data available')
            let chunks = [];
            if (event.data.size > 0) {
                chunks.push(event.data);
                let url = generateFile(chunks);
                setVideoSource(url);
            } else {
                console.log('no data!')
            }
        };
        setMediaRecorder(recorder);
        return recorder;
    }

    /**
     * 录制中
     */
    function recording() {
        if (mediaStream) {
            let recorder = mediaRecorder ? mediaRecorder : initMediaRecorder();
            recorder.start();
        } else {
            enqueueSnackbar('无效的媒体源，无法录制!', { variant: 'error', autoHideDuration: 2000 })
        }
    }

    /**
     * 录制停止
     */
    function recordStop() {
        let video = videoEle.current;
        console.log('timerId: %o, timeCount: %o, startTime: %o', timerId, timeCount, startTime.current);
        if (video && timerId != defaultTimerId) {
            video.pause();
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            setRecordBtnState(RecordBtnStateEnum.RETAKE);
            clearInterval(timerId);
        }
    }

    /**
     * 获取文件URL
     * @param {Blob[]} chunks 
     * @returns 
     */
    function generateFile(chunks) {
        let blob = new Blob(chunks, { type: mediaRecorderOptions.mimeType });
        console.log(`类型：${blob.type}，大小：${Tools.returnFileSize(blob.size)}`)
        let url = URL.createObjectURL(blob);
        console.log('url: ' + url);
        return url;
    }

    /**
     * 显示弹窗
     * @param {string} title 
     * @param {string} content 
     * @param {function} handleClose 
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

    function recordBtnClicked(ev) {
        enqueueSnackbar('显示video元素', { variant: 'info', autoHideDuration: 1000 })
        recordStart();
    }

    let handleReTakeOk = function (ok) {
        console.log('result: ' + ok)
        if (ok) {
            recordStart(); // 重录
        }
        setShowDialog(false)
    }

    function reTakeBtnClicked(ev) {
        switch (recordBtnState) {
            case (RecordBtnStateEnum.START): {
                enqueueSnackbar('开始录制', { variant: 'info', autoHideDuration: 1000 })
                recordStart();
            }; break;
            case (RecordBtnStateEnum.STOP): {
                // TODO 停止录制，保存为 Blob 或 File 
                recordStop();
            }; break;
            case (RecordBtnStateEnum.RETAKE): {
                // TODO 弹窗提示，是否确定要重新录制
                showAlertDialog('警告', '将清除原先录制的内容，确定要重新录制吗？', handleReTakeOk);
            }; break;
        }

    }

    function previewBtnClicked(ev) {
        // TODO
        enqueueSnackbar('跳转到预览', { variant: 'info', autoHideDuration: 2000 })
    }

    function finishBtnClicked() {
        // TODO
        enqueueSnackbar('完成', { variant: 'success', autoHideDuration: 2000 })
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
                    <div>时长：{Tools.formatDuration(timeCount)}</div>
                </div>
            </main>
            <footer>
            </footer>
            <AlertDialog open={showDialog} title={dialogTitle} content={dialogContent} handleClose={dialogHandleClose} />
            {loading && <ModelLoading />}
        </div>
    )
}
export default RecordVideo;