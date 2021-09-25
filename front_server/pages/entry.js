import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/entry.module.scss';

/** @type{number} */
const defaultCode = null;
const defaultRouterLoaded = false;

/**
 * 启动页
 */
function EntryPage() {

    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);

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
            alert('code: ' + code)
            setCode(code);
        }
        return () => {
            if (routerRefreshCount.current > 0) setRouterLoaded(true);
            routerRefreshCount.current += 1;
        }
    }, [router.query])

    useEffect(() => {
        if (code) {
            // TODO 判断code加载数据
            
            // TODO 延迟跳转

        }
    }, [code])

    return <div className={styles.container}>
        <Head>
            <title>{GlobalSettings.siteTitle('二维码生成')}</title>
            <meta charSet='utf-8' />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header>
            <p>EntryPage</p>
        </header>
        <main>
            {(routerLoaded && !code) && <p>未能读取信息，请扫描二维码重试！</p>}
        </main>
        <footer></footer>
    </div>;
}

export default EntryPage;