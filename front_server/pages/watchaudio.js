import { mdiDownload, mdiShareVariant } from '@mdi/js';
import Icon from "@mdi/react";
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
import styles from '../styles/watchaudio.module.scss';

const defaultRouterLoaded = false;
/** @type{string} */
const defaultCode = null;
/** @type{Uploadfiles} */
const defaultUploadInfo = null;

const defaultLoading = false;
const defaultDialog = { open: false, title: '提示', content: '确认' };
const defaultFileURL = '';

function WatchAudio() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(defaultCode);
    const [uploadInfo, setUploadInfo] = useState(defaultUploadInfo);
    const [textFrom, setTextFrom] = useState('');
    const [textTo, setTextTo] = useState('');
    const [fileURL, setFileURL] = useState(defaultFileURL);
    /** @type {{current: HTMLAudioElement}} */
    const audioEle = useRef(null);
    const [showDialog, setShowDialog] = useState(defaultDialog.open);
    const [dialogTitle, setDialogTitle] = useState(defaultDialog.title);
    const [dialogContent, setDialogContent] = useState(defaultDialog.content);
    let defaultHandleClose = function (ok) { setShowDialog(false) };
    const [dialogHandleClose, setDialogHandleClose] = useState(defaultHandleClose);

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
            if (result.text_from) setTextFrom(result.text_from);
            if (result.text_to) setTextTo(result.text_to);
            if (result.audioPath) {
                let url = FileService.getFile(result.audioPath);
                setFileURL(url);
                initRemoteAudio(url);
            } else {
                console.log('当前尚未上传过音频文件')
                enqueueSnackbar('当前尚未上传音频文件', { variant: 'info', autoHideDuration: 2000 })
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
        setAudioSource(remoteUrl);
    }

    function setAudioSource(stream) {
        let audio = audioEle.current;
        audio.oncanplay = () => {
            if (audio.src) {
                console.log('媒体时长：' + audio.duration)
                enqueueSnackbar('音频时长：' + audio.duration + '秒', { variant: 'info', autoHideDuration: 1000 });
            }
        }
        if (audio) {
            if (stream) {
                audio.src = stream;
            } else {
                audio.src = defaultFileURL;
                console.log('null video source')
            }
        } else {
            console.log('audio 元素尚未加载')
        }
    }



    function shareBtnClicked() {
        // 复制当前页面的URL
        let url = window.location.href;
        window.navigator.clipboard.writeText(url).then((result) => {
            enqueueSnackbar('已将网址复制到剪切板', { variant: 'success', autoHideDuration: 2000 })
        }).catch((err) => { // 安卓会报错
            enqueueSnackbar('从浏览器中直接分享页面即可', { variant: 'info', autoHideDuration: 2000 })
        });
    }

    function downloadBtnClicked() {
        // TODO 下载链接点击（ios无效）
        if (fileURL) {
            if ("Safari" == Tools.myBrowser()) {
                console.log('Safari，弹窗')
                enqueueSnackbar('iphone无法直接下载，请使用电脑或安卓设备打开页面并下载', { variant: 'info', autoHideDuration: 8000 })
            } else {
                console.log('非 Safari，直接下载')
                Tools.download(fileURL, Tools.getFileName(fileURL))
            }
        } else {
            console.log('文件不存在，未下载')
            enqueueSnackbar('文件不存在，未下载', { variant: 'warning', autoHideDuration: 2000 })
        }
    }

    /**
     * 显示弹窗
     * @param {string} title 
     * @param {string} content 
     * @param {function} [handleClose] 
     */
    function showAlertDialog(title, content, handleClose) {
        setDialogTitle(value => title || defaultDialog.title)
        setDialogContent(value => content || defaultDialog.content)
        setDialogHandleClose(value => handleClose || defaultHandleClose)
        setShowDialog(true)
    }


    return (
        <div className={styles.container}>
            <Head>
                <title>留声机</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='留声机'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img>
                    <div className={styles.text_to}>TO：{textTo}</div>
                    <div className={styles.text_from}>FROM：{textFrom}</div>
                </div>
                <div className={styles.float_bar}>
                    <div className={styles.float_share} title="分享" onClick={shareBtnClicked}>
                        <Icon path={mdiShareVariant} size={1}></Icon>
                    </div>
                    <div className={styles.float_download} title="下载" onClick={downloadBtnClicked}>
                        <Icon path={mdiDownload} size={1}></Icon>
                    </div>
                </div>
                <div className={styles.btn_panel}>
                    <audio className={styles.audio} controls={true} preload="auto" ref={audioEle}>
                    </audio>
                </div>
            </main>
            <footer>
            </footer>
            <AlertDialog open={showDialog} title={dialogTitle} content={dialogContent} handleClose={dialogHandleClose} />
        </div>
    )
}
export default WatchAudio;