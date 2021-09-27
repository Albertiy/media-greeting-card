import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import NoStyleInput from '../src/component/input_nostyle';
import LabelInput from '../src/component/label_input';
import TitleBar from '../src/component/title_bar';
import Uploadfiles from '../src/model/uploadfiles';
import * as FileService from '../src/service/file_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/message.module.scss';

const defaultRouterLoaded = false;
const defaultCode = null;
const defaultTextFrom = '';
const defaultTextTo = '';
/** @type{null|"video"|"audio"} */
const defaultInfoType = null;
/** @type{Uploadfiles} */
const defaultUploadInfo = null;
/** @type{(value)=>{}} */
const defaultNoStyleInput = null;

export default function MessagePage() {

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);
    const [uploadInfo, setUploadInfo] = useState(defaultUploadInfo);
    const [infoType, setInfoType] = useState(defaultInfoType);
    const [textFrom, setTextFrom] = useState(defaultTextFrom);
    const [textTo, setTextTo] = useState(defaultTextTo);
    const textFromInput = useRef(defaultNoStyleInput);
    const textToInput = useRef(defaultNoStyleInput);

    useEffect(() => {
        console.log('第' + (routerRefreshCount.current + 1) + '次路由刷新')
        let params = router.query;
        console.log('params: %o', params)
        if (params && params.code) {
            let code = params.code;
            enqueueSnackbar('code: ' + code, { variant: 'info', autoHideDuration: 1000 })
            setCode(code);
            getInfoByCode(code);
        }
        if (routerRefreshCount.current > 0) setRouterLoaded(true);
        routerRefreshCount.current += 1;
    }, [router.query])

    /**
     * 加载现有数据
     * @param {string} code 
     */
    function getInfoByCode(code) {
        // 判断code加载数据
        FileService.getUploadInfo(code).then((result) => {
            console.log('结果：%o', result);
            setUploadInfo(result);
            if (result.text_from) {
                setTextFrom(result.text_from);
                if (textFromInput.current) {
                    // console.log('%o', textFromInput.current);
                    textFromInput.current(result.text_from);
                }
            }
            if (result.text_to) {
                setTextTo(result.text_to);
                if (textToInput.current) {
                    // console.log('%o', textToInput.current);
                    textToInput.current(result.text_to);
                }
            }
        }).catch((err) => { // 说明code无效，此时UploadInfo为空
            enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
        });
    }

    function saveText() {
        console.log('From: %s, To: %s', textFrom, textTo)
        return FileService.uploadGreetingText(code, textFrom, textTo);
    }

    function nextBtnClicked() {
        if (uploadInfo) {
            saveText().then((result) => {
                enqueueSnackbar('文本保存成功！', { variant: 'success', autoHideDuration: 1000 })
                if (uploadInfo.videoPath) {
                    router.push({ pathname: '/recordvideo', query: { code } })
                } else if (uploadInfo.audioPath) {
                    router.push({ pathname: '/recordaudio', query: { code } })
                } else {
                    router.push({ pathname: '/method', query: { code } })
                }
            }).catch((err) => {
                enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
            });
        } else {
            enqueueSnackbar('无效的code，请重新扫码', { variant: 'error', autoHideDuration: 2000 })
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('首页')}</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <TitleBar title='首页'></TitleBar>
            </header>
            <main className={styles.main}>
                <div className={styles.logo}></div>
                <LabelInput name='from' label='我是:'>
                    <NoStyleInput className={styles.input} maxLength={20} defaultValue={textFrom} onChange={(ele) => { setTextFrom(ele.value) }} parentRef={textFromInput} />
                </LabelInput>
                <LabelInput name='to' label='送给:' style={{ marginTop: '10%' }}>
                    <NoStyleInput className={styles.input} maxLength={20} defaultValue={textTo} onChange={(ele) => { setTextTo(ele.value) }} parentRef={textToInput} />
                </LabelInput>
                <div className={styles.message_btn} onClick={nextBtnClicked}>
                    <div className={styles.logo2}></div>
                    <div>开始留言</div>
                </div>
            </main>
            <footer className={styles.footer}>
            </footer>
        </div >
    )
}
