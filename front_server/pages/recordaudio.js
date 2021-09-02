import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordaudio.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiMicrophone } from '@mdi/js';

const defaultTimeInfo = '00:00';

function RecordAudio() {

    const [timeInfo, setTimeInfo] = useState(defaultTimeInfo);

    return (
        <div className={styles.container}>
            <Head>
                <title>录音棚  </title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='录音棚'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img>
                </div>
                <div className={styles.btn_panel}>
                    <div className={styles.btn}>
                        <div className={styles.icon}>
                            <Icon path={mdiPlay} size={1} /></div>
                        <div>预览</div>
                    </div>
                    <div className={styles.btn}>
                        <div className={styles.icon}>
                            <Icon path={mdiMicrophone} size={1} /></div>
                        <div>录音</div>
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