import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordvideo.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiRefresh, mdiVideoOutline } from '@mdi/js';
import { useSnackbar } from 'notistack';

const defaultTimeInfo = '00:00';

function RecordVideo() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [showVideo, setShowVideo] = useState(false);
    const [timeInfo, setTimeInfo] = useState(defaultTimeInfo);
    /** @type {{current: HTMLVideoElement}} */
    const videoEle = useRef(null);

    useEffect(() => {
        getVideo();
    }, []);

    function getVideo() {
        let constraints = { audio: true, video: { width: 1280, height: 720 } }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (mediaStream) {
                let video = videoEle.current;
                video.srcObject = mediaStream;
                video.onloadedmetadata = function (e) {
                    video.play();
                };
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
                if (err.name == 'NotFoundError')
                    enqueueSnackbar('当前设备缺少麦克风或摄像头', { variant: 'error', autoHideDuration: 2000 })
            })
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
                    {showVideo ? <video className={styles.video} ref={videoEle} controls={true}></video> :
                        <div>
                            <div>
                                <Icon className={styles.cover_icon} path={mdiVideoOutline} />
                            </div>
                            <div>点击录制视频</div>
                        </div>
                    }
                    {/* <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img> */}
                </div>
                <div className={styles.btn_panel}>
                    <div className={styles.btn}>
                        <div className={styles.icon}>
                            <Icon path={mdiPlay} size={1} /></div>
                        <div>预览</div>
                    </div>
                    <div className={styles.btn}>
                        <div className={styles.icon}>
                            <Icon path={mdiRefresh} size={1} /></div>
                        <div>重录</div>
                    </div>
                    <div className={styles.btn}>
                        <div className={styles.icon}>
                            <Icon path={mdiCheckBold} size={1} /></div>
                        <div>完成</div>
                    </div>
                </div>
                <div className={styles.info}>
                    <div>时长：{timeInfo}</div>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
export default RecordVideo;