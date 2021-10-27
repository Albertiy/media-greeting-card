import { Button, Input, Layout } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import FloatSidebar from '../../src/component/float_sidebar/FloatSidebar'
import ModelLoading from '../../src/component/model_loading'
import useAccessToken from '../../src/hook/useAccessToken'
import useCode from '../../src/hook/useCode'
import Article from '../../src/model/article'
import { SkeletonTemplate } from '../../src/model/skeleton_template'
import Uploadfiles from '../../src/model/uploadfiles'
import * as ArtService from '../../src/service/art_service'
import * as fileService from '../../src/service/file_service'
import GlobalSettings from '../../src/setting/global'
import styles from './update_text.module.scss'

/**@type{Uploadfiles} */
const defaultRecord = null;
/** @type{Article} */
const defaultArticle = null;
/** @type{SkeletonTemplate[1]} */
const defaultSkeleton = null;

export default function UpdateText() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { code } = useCode();
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [textTitle, setTextTitle] = useState('')
    const [textContent, setTextContent] = useState('')
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const access_token = useAccessToken();


    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** 初始化skeleton，加载内容 */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            console.log('title: %o, contentList %o', skeleton.title, skeleton.textList)
            // 标题内容
            if (skeleton.title) {
                setTextTitle(skeleton && skeleton.title)
            }
            // 文字内容
            if (skeleton.textList && skeleton.textList[0]) {
                setTextContent(skeleton && skeleton.textList && skeleton.textList[0]);
            }
            setDataLoaded(true)
        }
    }, [skeleton])

    /**
     * 根据 code 获取二维码主记录和二维码图文内容
     * @param {string} code 
     * @returns 
     */
    async function getInfoByCode(code) {
        try {
            let { record, article } = await ArtService.getRecordAndArticle(code);
            console.log('record: %o\narticle: %o\nskeleton: %o', record, article, article.skeleton)
            if (record.needAccessPwd && !access_token) { // 跳转输入访问密码页面
                console.log('access_token: %o', access_token);
                router.push({ pathname: '/access_login', query: { code } })
                return;
            }
            setRecord(record);
            setArticle(article);
            setSkeleton(article.skeleton);
        } catch (error) {
            console.log(error)
            enqueueSnackbar(error.toString())
        }
    }

    /**
     * 点击登录按钮
     * @param {*} event 
     */
    function confirmBtnClicked(event) {
        if (!code)
            enqueueSnackbar('编码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (textTitle == undefined || textTitle == '')
            enqueueSnackbar('标题不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (textContent == undefined || textContent == '')
            enqueueSnackbar('内容不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else {
            submit()
        }
    }

    /**
     * 登录
     */
    function submit() {
        console.log('code: %o, oldPwd: %o, newPwd: %o', code, textTitle, textContent)
        try {
            setIsLoading(true)
            // 后台请求
            ArtService.updateText(code, textTitle, textContent).then(res => {
                enqueueSnackbar('' + res, { variant: 'success', autoHideDuration: 2000 })
                if (window.history.length > 1)
                    router.back();
                else
                    router.push({ pathname: '/entry', query: { code } });
            }).catch((err) => {
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
            }).finally(() => {
                setIsLoading(false)
            })
        } finally { }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('更新文本')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Layout className={styles.contentContainer}>
                    {/* <Space direction="vertical" size="large" className={styles.form}> */}
                    <div className={styles.form}>
                        <label className={styles.label}>更新文本内容：</label>
                        <label className={styles.inputLabel}>标题</label>
                        <Input className={styles.titleTitle} placeholder="标题" size="large" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} maxLength={100} style={{ backgroundColor: 'transparent', color: 'rgb(228, 228, 228)' }} />
                        <label className={styles.inputLabel}>内容</label>
                        <Input.TextArea className={styles.textContent} placeholder="在此输入内容" size="large" value={textContent} onChange={(e) => setTextContent(e.target.value)} maxLength={600} style={{ height: '300px' }} />
                        <label className={styles.notice}>注：不能上传违法信息，如有，将追究法律责任。</label>
                        <Button type="primary" block={true} className={styles.btn} size="large" onClick={confirmBtnClicked} disabled={!dataLoaded}>提交</Button>
                    </div>
                    {/* </Space> */}
                    {isLoading && <ModelLoading />}
                </Layout>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtnContainer}>
                        <FloatSidebar code={code}></FloatSidebar>
                    </section>
                </div>
            </main>
        </div>
    )
}
