import { mdiMenu } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from 'antd';
import Head from 'next/head';
import router from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import BackgroundMusic from '../src/component/background_music/background_music';
import MainImage from '../src/component/main_image/MainImage';
import Paragraph from '../src/component/paragraph/Paragraph';
import useAccessToken from '../src/hook/useAccessToken';
import useCode from '../src/hook/useCode';
import Article from '../src/model/article';
import SkeletonTemplate from '../src/model/skeleton_template';
import Uploadfiles from '../src/model/uploadfiles';
import * as ArtService from '../src/service/art_service';
import { getFile } from '../src/service/file_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1.module.scss';

/**@type{Uploadfiles} */
const defaultRecord = null;
/** @type{Article} */
const defaultArticle = null;
/** @type{SkeletonTemplate[1]} */
const defaultSkeleton = null;
/** @type{string} */
const defaultBgImageUrl = null;
/** @type{string} */
const defaultBgMusicUrl = null;
const defaultP1 = '';

function ArtTemp1() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { code, routerRefreshCount, routerLoaded } = useCode();
    const access_token = useAccessToken();
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const [bgImageUrl, setBgImageUrl] = useState(defaultBgImageUrl);
    const [musicOn, setMusicOn] = useState(false);
    const [bgMusicUrl, setBgMusicUrl] = useState(defaultBgMusicUrl);
    const [p1, setP1] = useState(defaultP1)
    const [cookies, setCookie, removeCookie] = useCookies();
    const [previewSrc, setPreviewSrc] = useState(null);

    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** 初始化skeleton，加载内容 */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            // 加载背景图片
            if (skeleton.customBgImageId) { // 自定义背景id
                ArtService.getImage(skeleton.customBgImageId).then((result) => {
                    console.log('[customBgImage url]: %o', result.path)
                    let src = getFile(result.path)
                    src = src.replace('\\', '/')    // 解决反斜杠在style中会转义问题
                    setBgImageUrl(src)
                }).catch((err) => {
                    enqueueSnackbar('' + err, { variant: 'warning', autoHideDuration: 2000 })
                });
            }
            else if (skeleton.bgImageId) {  // 官方背景id
                ArtService.getBgImage(skeleton.bgImageId).then((result) => {
                    console.log('[bgimage url]: %o', result)
                    setBgImageUrl(getFile(result))
                }).catch((err) => {
                    console.log(err)
                });
            }
            // 加载背景音乐
            if (skeleton.bgMusicId) {   // 官方BGM
                ArtService.getMusic(skeleton.bgMusicId).then((result) => {
                    console.log('[bgmusic url]: %o', result)
                    setBgMusicUrl(getFile(result))
                }).catch((err) => {
                    console.log(err)
                });
            }
            // 页面标题
            // if (skeleton.title) { }
            // 文字内容
            if (skeleton.textList && skeleton.textList[0]) {
                setP1(skeleton && skeleton.textList && skeleton.textList[0]);
            }
            // 图片内容
            if (skeleton.imageList && skeleton.imageList[0]) {
                ArtService.getImage(skeleton.imageList[0]).then((result) => {
                    let src = getFile(result.path)
                    setPreviewSrc(src)
                }).catch((err) => {
                    enqueueSnackbar('' + err, { variant: 'warning', autoHideDuration: 2000 })
                })
            }
        }
    }, [skeleton])

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

    return <div className={styles.container}>
        <Head>
            <title>{(skeleton && skeleton.title) || GlobalSettings.siteTitle('模板定制')}</title>
            <meta charSet='utf-8' />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header>
        </header>
        <main className={styles.main} style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}>
            {/* 背景层 */}
            <div className={styles.contentLayer}>
                <section className={styles.mainImageContainer}>
                    <MainImage src={previewSrc}></MainImage>
                </section>
                <section className={styles.mainParagraphContainer}>
                    {/*  contentEditable="true" suppressContentEditableWarning="true"  */}
                    <Paragraph value={p1} readOnly={true} style={{ backgroundColor: 'transparent' }}></Paragraph>
                </section>
                <section className={styles.interactiveMessageContainer}>
                </section>
            </div>
            <div className={styles.upperLayer}>
                <section className={styles.musicBtnContainer}>
                    <BackgroundMusic musicOn={musicOn} source={bgMusicUrl} onClick={() => { setMusicOn(old => !old) }}></BackgroundMusic>
                </section>
                <section className={styles.menuBtnContainer}>
                    {/* <FloatSidebar code={code}></FloatSidebar> */}
                    <Button className={styles.manageBtn} title="更多"
                        onClick={() => { console.log('更多'); router.push({ pathname: '/at_1_manage', query: { code } }) }} >
                        <Icon path={mdiMenu} size={1.0} />
                    </Button>
                </section>
            </div>
        </main>
        <footer>
        </footer>
    </div>;
}

export default ArtTemp1;