import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/watchaudio.module.scss'
import Icon from "@mdi/react";
import { mdiPlay, mdiCheckBold, mdiMicrophone } from '@mdi/js';

const defaultTimeInfo = '00:00';

function RecordAudio() {

    const [timeInfo, setTimeInfo] = useState(defaultTimeInfo);

    return (
        <div className={styles.container}>
            <Head>
                <title>留声机</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='留声机'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.cover}>
                    <img className={styles.cover_image} src="img/turntable.png" alt='封面图' title='封面'></img>
                    <div className={styles.text_to}>TO：小美</div>
                    <div className={styles.text_from}>FROM：锤锤</div>
                </div>
                <div className={styles.btn_panel}>
                    <audio className={styles.audio} controls={true} preload="auto" >
                        <source src="" />
                    </audio>
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