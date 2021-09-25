import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import TitleBar from '../src/component/title_bar';
import styles from '../styles/method.module.scss';

const defaultRouterLoaded = false;
const defaultCode = null;

function MethodPage() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);

    useEffect(() => {
        console.log('第' + (routerRefreshCount.current + 1) + '次路由刷新')
        let params = router.query;
        console.log('params: %o', params)
        if (params && params.code) {
            let code = params.code;
            enqueueSnackbar('code: ' + code, { variant: 'info', autoHideDuration: 1000 })
            setCode(code);
        }
        return () => {
            if (routerRefreshCount.current > 0) setRouterLoaded(true);
            routerRefreshCount.current += 1;
        }
    }, [router.query])

    function chooseAudio() {
        enqueueSnackbar('选择了音频，即将跳转到音频录制页...', { variant: 'info', autoHideDuration: 1000 })
        router.push({ pathname: '/recordaudio', query: { code } })

    }

    function chooseVideo() {
        enqueueSnackbar('选择了视频，即将跳转到视频录制页...', { variant: 'info', autoHideDuration: 1000 })
        router.push({ pathname: '/recordvideo', query: { code } })
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>选择留言方式</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='选择留言方式'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.btn} onClick={chooseAudio}>
                    <div className={styles.audio_logo}></div>
                    <div>录音</div>
                </div>
                <div className={styles.btn} onClick={chooseVideo}>
                    <div className={styles.video_logo}></div>
                    <div>录像</div>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}

export default MethodPage;