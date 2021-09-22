import Head from "next/head";
import styles from "../styles/greeting.module.css";
import { useState, useEffect, useRef } from 'react';
import * as tools from '../src/tool/tools';
import * as FileService from '../src/service/file_service';
import { useSnackbar } from 'notistack';
import { LinearProgress } from '@material-ui/core'

/** @type {File} */
const defaultAudioFile = null;
/** @type {File} */
const defaultVideoFile = null;

const defaultProgressValue = 0;

function GreetingPage(props) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let [isInWeChat, setIsInWeChat] = useState(true);

    useEffect(() => {
        setIsInWeChat(tools.isInWeChat)
        // alert(tools.myBrowser())
    }, [])

    let [audioFile, setAudioFile] = useState(defaultAudioFile);
    let [videoFile, setVideoFile] = useState(defaultVideoFile);
    let [progressValue, setProgressValue] = useState(defaultProgressValue);


    /** @type{{current: HTMLInputElement}} */
    let videoInput = useRef(null);
    /** @type{{current: HTMLInputElement}} */
    let audioInput = useRef(null);
    /** @type{{current: HTMLAudioElement}} */
    let audioPlay = useRef(null);
    /** @type{{current: HTMLVideoElement}} */
    let videoPlay = useRef(null);
    /** @type{{current: HTMLParagraphElement}} */
    let consoleOutput = useRef(null);

    function onInputVideoChange(e) {
        outPutToText(e)
        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0];
            console.log('上传的视频：%o', file);
            setVideoFile(file);
            outPutToText(`${file.name} ${tools.returnFileSize(file.size)} ${file.type}`);
            let url = URL.createObjectURL(file);
            outPutToText(url);
            if (videoPlay.current)
                videoPlay.current.src = url;
        }
    }

    function onInputAudioChange(e) {
        outPutToText(e)
        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0];
            console.log('上传的音频：%o', file);
            setAudioFile(file);
            outPutToText(`${file.name} ${tools.returnFileSize(file.size)} ${file.type}`);
            let url = URL.createObjectURL(file);
            outPutToText(url);
            if (audioPlay.current) {
                audioPlay.current.src = url;
            }
        }
    }

    function outPutToText(text) {
        console.log(text);
        if (consoleOutput.current) consoleOutput.current.innerText += text + '\n';
    }

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

    function uploadFiles() {
        setProgressValue(defaultProgressValue);
        if (!videoFile && !audioFile) {
            enqueueSnackbar('音视频至少上传其中一个', { variant: 'warning', autoHideDuration: 2000 });
        } else {
            FileService.uploadGreetings(videoFile, audioFile, progressUpload).then((result) => {
                enqueueSnackbar('' + result, { variant: 'success', autoHideDuration: 2000 })
                setProgressValue(1);
            }).catch((err) => {
                console.log(err)
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
                setProgressValue(defaultProgressValue);
            }).finally(() => {

            });
        }
    }

    return (<div>
        <Head>
            <title>H5音视频播放测试</title>
        </Head>
        <header>
        </header>
        <main>
            <div className={styles.container}>
                <div>{isInWeChat ? '您正在微信浏览器中使用' : '请在微信浏览器中打开此页面！（分享此页面到微信，或者微信扫码）'}</div>
                <div className={styles.row}>
                    <label>音频：</label>
                    <input type="file" name="audioInput" id="audio_input" accept="audio/*" ref={audioInput} onChange={onInputAudioChange} />
                    {/* <!-- capture="microphone" --> */}
                    <label>视频：</label>
                    <input type="file" name="videoInput" id="video_input" accept="video/*" ref={videoInput} onChange={onInputVideoChange} />
                    {/* <!-- capture="camcorder" --> */}
                </div>
                <div className={styles.row}>
                    <audio id="audio_play" controls ref={audioPlay}>当前浏览器不支持HTML5音频组件</audio>
                    <video id="video_play" className={styles.video_play} controls ref={videoPlay}>当前浏览器不支持HTML5视频组件</video>
                </div>
                <div className={styles.row}>
                    <button onClick={uploadFiles}>上传音视频</button>
                </div>
                <div className={styles.row} style={{ width: "100%" }}>
                    <LinearProgress variant="determinate" value={progressValue * 100} style={{ width: "80%", margin: "20px 0 20px" }} /><span>{progressValue.toFixed(2) + '%'}</span>
                </div>
                <div className={styles.row}>
                    输出：
                    <p id="console_output" ref={consoleOutput}>
                    </p>
                </div>
            </div>
        </main>
        <footer>
        </footer>
    </div>);
}

export default GreetingPage;