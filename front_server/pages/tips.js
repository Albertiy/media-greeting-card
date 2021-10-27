import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useCookies } from 'react-cookie';
import FloatSidebar from '../src/component/float_sidebar/FloatSidebar';
import useCode from '../src/hook/useCode';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1_manage.module.scss';

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
                        <p>温馨提示</p>
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
