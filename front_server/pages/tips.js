import Head from 'next/head';
import router from 'next/router';
import { useSnackbar } from 'notistack';
import { useCookies } from 'react-cookie';
import FloatSidebar from '../src/component/float_sidebar/FloatSidebar';
import useCode from '../src/hook/useCode';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1_manage.module.scss';

export default function tips() {
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
                        <FloatSidebar onItemClicks={[function () { router.push({ pathname: '/at_1_manage', query: { code } }) },
                        function () { router.push({ pathname: '/login_pwd', query: { code } }) },
                        function () { router.push({ pathname: '/tips', query: { code } }) }]} onQuitClick={function () {
                            console.log('退出')
                            removeCookie(GlobalSettings.modifyToken || 'modify_token')
                            console.log('modify_token: %o', cookies[GlobalSettings.modifyToken])
                            router.push({ pathname: '/at_1', query: { code } })
                        }}></FloatSidebar>
                    </section>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
