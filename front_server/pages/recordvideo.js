import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordvideo.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiRefresh, mdiVideoOutline } from '@mdi/js';

const defaultTimeInfo = '00:00';

function RecordAudio() {

    const [timeInfo, setTimeInfo] = useState(defaultTimeInfo);

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
                    <div>
                        <Icon className={styles.cover_icon} path={mdiVideoOutline} />
                    </div>
                    <div>点击录制视频</div>
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
export default RecordAudio;