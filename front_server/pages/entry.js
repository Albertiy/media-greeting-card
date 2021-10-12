import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import * as ArtService from '../src/service/art_service';
import * as FileService from '../src/service/file_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/entry.module.scss';

/** @type{number} */
const defaultCode = null;
const defaultRouterLoaded = false;
const defaultInfoText = '等待跳转...';
const failCodeText = '未能读取信息，请扫描二维码重试！';

/**
 * 启动页
 */
function EntryPage() {

    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [infoText, setInfoText] = useState(defaultInfoText);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        // 预加载页面
        router.prefetch('/method')
        router.prefetch('/watchvideo')
        router.prefetch('/watchaudio')
    })

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

        if (routerRefreshCount.current > 0) { setRouterLoaded(true); console.log('路由参数已加载') }
        routerRefreshCount.current += 1;
    }, [router.query])

    useEffect(() => {
        if (!code) setInfoText(failCodeText);
    }, [routerLoaded, code])


    function getInfoByCode(code) {
        // 判断code加载数据
        console.log('[getUploadInfo] 开始：code=%o', code)
        FileService.getUploadInfo(code).then((record) => {
            console.log('[getUploadInfo] 结果：%o', record);
            // TODO 延迟跳转
            if (record.product_id == 2) {
                console.log('[getArticle] 开始：code=%o', record.id)
                ArtService.getArticle(record.id).then((art) => {
                    console.log('[getArticle] 结果：%o', art)
                    router.replace({ pathname: '/at_1', query: { code } })
                }).catch((err) => {
                    console.log(err)
                    setInfoText(err.toString())
                    enqueueSnackbar(err.toString(), { autoHideDuration: 2000, variant: 'error' })
                });
            } else {
                if (!record.isLocked) { // 未上锁
                    router.replace({ pathname: '/message', query: { code } })
                } else {    // 已上锁，直接进入展示页
                    if (record.videoPath)
                        router.replace({ pathname: '/watchvideo', query: { code } })
                    else if (record.audioPath)
                        router.replace({ pathname: '/watchaudio', query: { code } })
                }
            }

        }).catch((err) => {
            // 说明code无效
            enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
            setInfoText(err.toString());
        });
    }

    return <div className={styles.container}>
        <Head>
            <title>{GlobalSettings.siteTitle('二维码生成')}</title>
            <meta charSet='utf-8' />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header>
            <p>{infoText}</p>
        </header>
        <main className={styles.main}>
        </main>
        <footer></footer>
    </div>;
}

export default EntryPage;