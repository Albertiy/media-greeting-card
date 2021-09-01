import Head from 'next/head';
// import { useRoute } from 'next/router';
import styles from '../styles/method.module.scss';
import TitleBar from '../src/component/title_bar';

function MethodPage() {

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
                <div className={styles.btn}>
                    <div className={styles.audio_logo}></div>
                    <div>录音</div>
                </div>
                <div className={styles.btn}>
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