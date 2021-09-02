import Head from "next/head";
import { useState } from "react";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/watchaudio.module.scss'
import Icon from "@mdi/react";
import { mdiShareVariant, mdiDownload } from '@mdi/js';

const defaultTimeInfo = '00:00';

function WatchAudio() {

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
                    <audio className={styles.audio} controls={true} preload="auto" src="http://other.web.re01.sycdn.kuwo.cn/7be5f59e2dcd96d6a13ae276087aef18/613077cb/resource/n3/27/32/2494893181.mp3" >
                    </audio>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
export default WatchAudio;