import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useCookies } from 'react-cookie';
import FloatSidebar from '../src/component/float_sidebar/FloatSidebar';
import useCode from '../src/hook/useCode';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/tips.module.scss';

export default function Tips() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { code, routerRefreshCount, routerLoaded } = useCode()
    const [cookies, setCookie, removeCookie] = useCookies();

    return (
        <div className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('温馨提示')}</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
            </header>
            <main className={styles.main}>
                <div className={styles.contentLayer}>
                    <section className={styles.tipsContainer}>
                        <label className={styles.label}>温馨提示</label>
                        <div>
                            <p className={styles.details}>
                                初始管理密码 123456；
                            </p>
                            <p className={styles.details}>
                                加密：设置进入预览效果页面的访问密码；
                            </p>
                            <p className={styles.details}>
                                默认预览：设置后，扫码将直接看到预览的效果；
                            </p>
                            <p className={styles.details}>
                                左上角按钮：进入管理页，或打开侧边栏；
                            </p>
                            <p className={styles.details}>
                                右上角按钮：当设置了背景音乐时，点击按钮播放或暂停BGM。
                            </p>
                        </div>
                    </section>
                </div>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtnContainer}>
                        <FloatSidebar code={code}></FloatSidebar>
                    </section>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
