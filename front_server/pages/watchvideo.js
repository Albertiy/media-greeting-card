import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/watchvideo.module.scss'
import Icon from "@mdi/react";
import { mdiShareVariant, mdiDownload } from '@mdi/js';

const defaultTimeInfo = '00:00';

function WatchVideo() {

    const [timeInfo, setTimeInfo] = useState(defaultTimeInfo);

    return (
        <div className={styles.container}>
            <Head>
                <title>放映厅</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='放映厅'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <video className={styles.video} controls={true} src="https://media.w3.org/2010/05/sintel/trailer.mp4"></video>
                    <div className={styles.text_to}>TO：小美</div>
                    <div className={styles.text_from}>FROM：锤锤</div>
                </div>
                <div className={styles.float_bar}>
                    <div className={styles.float_share} title="分享">
                        <Icon path={mdiShareVariant} size={1}></Icon>
                    </div>
                    <div className={styles.float_download} title="下载">
                        <Icon path={mdiDownload} size={1}></Icon>
                    </div>
                </div>
                <div className={styles.btn_panel}>
                </div>
            </main>
            <footer>
            </footer>
        </div >
    )
}
export default WatchVideo;