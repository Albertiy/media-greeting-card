import Head from 'next/head'
import LabelInput from '../src/component/label_input'
import NoStyleInput from '../src/component/input_nostyle'
import TitleBar from '../src/component/title_bar'
import styles from '../styles/message.module.scss'

export default function MessagePage() {
    return (
        <div className={styles.container}>
            <Head>
                <title>首页</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='首页'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.logo}></div>
                <LabelInput name='from' label='我是:'>
                    <NoStyleInput className={styles.input} maxLength={20}></NoStyleInput>
                </LabelInput>
                <LabelInput name='to' label='送给:' style={{ marginTop: '10%' }}>
                    <NoStyleInput className={styles.input} maxLength={20}></NoStyleInput>
                </LabelInput>
                <div className={styles.message_btn}>
                    <div className={styles.logo2}></div>
                    <div>开始留言</div>
                </div>
            </main>
            <footer className={styles.footer}>
            </footer>
        </div >
    )
}
