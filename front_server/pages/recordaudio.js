import Head from "next/head";
import TitleBar from "../src/component/title_bar";
import styles from '../styles/recordaudio.module.scss'

function RecordAudio() {
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
                    <img className={styles.cover_image}></img>
                </div>
                <div className={styles.btn_panel}>

                </div>
                <div className={styles.info}>

                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
export default RecordAudio;