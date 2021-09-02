import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/watchaudio.module.scss'
import Icon from "@mdi/react";
import { mdiShareVariant, mdiDownload } from '@mdi/js';

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
                <div className={styles.float_bar}>
                    <div className={styles.float_share} title="分享">
                        <Icon path={mdiShareVariant} size={1}></Icon>
                    </div>
                    <div className={styles.float_download} title="下载">
                        <Icon path={mdiDownload} size={1}></Icon>
                    </div>
                </div>
                <div className={styles.btn_panel}>
                    <audio className={styles.audio} controls={true} preload="auto" src="http://other.web.nf01.sycdn.kuwo.cn/6f27093b9bbe6808c6094daf073c89d3/61306d12/resource/n2/25/82/4077967709.mp3" >
                    </audio>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
export default RecordAudio;