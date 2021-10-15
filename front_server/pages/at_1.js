import { mdiMusic, mdiMusicOff } from '@mdi/js';
import { Icon } from '@mdi/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import BackgroundMusic from '../src/component/background_music/background_music';
import Article from '../src/model/article';
import { SkeletonTemplate } from '../src/model/skeleton_template';
import Uploadfiles from '../src/model/uploadfiles';
import * as ArtService from '../src/service/art_service';
import { getFile } from '../src/service/file_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1.module.scss';

const defaultRouterLoaded = false;
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

function ArtTemp1() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(defaultRouterLoaded);
    const [code, setCode] = useState(null);
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const [bgImageUrl, setBgImageUrl] = useState(defaultBgImageUrl);
    const [musicOn, setMusicOn] = useState(false);
    const [bgMusicUrl, setBgMusicUrl] = useState(defaultBgMusicUrl);

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

        if (routerRefreshCount.current > 0) { setRouterLoaded(true); console.log('路由参数已加载') }
        routerRefreshCount.current += 1;
    }, [router.query])

    /** 初始化skeleton */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            if (skeleton.customBgImageId) {

            }
            else if (skeleton.bgImageId) {
                ArtService.getBgImage(skeleton.bgImageId).then((result) => {
                    console.log('[bgimage url]: %o', result)
                    setBgImageUrl(getFile(result))
                }).catch((err) => {
                    console.log(err)
                });
            }
            if (skeleton.bgMusicId) {
                ArtService.getMusic(skeleton.bgMusicId).then((result) => {
                    console.log('[bgmusic url]: %o', result)
                    setBgMusicUrl(getFile(result))
                }).catch((err) => {
                    console.log(err)
                });
            }
        }
    }, [skeleton])

    async function getInfoByCode(code) {
        try {
            let { record, article } = await ArtService.getRecordAndArticle(code);
            console.log('record: %o\narticle: %o\nskeleton: %o', record, article, article.skeleton)
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
                    {(skeleton && skeleton.imageList && skeleton.imageList[0]) ? (
                        <img src={getFile(skeleton.imageList[0])}></img>
                    ) : (
                        <div className={styles.mainImageBorder}>点击上传照片</div>
                    )}
                </section>
                <section className={styles.mainParagraphContainer}>
                    <p className={styles.paragraph} contentEditable="true" suppressContentEditableWarning="true" onChange={(e) => { console.log(e) }}>xxx</p>
                </section>
                <section className={styles.interactiveMessageContainer}>
                </section>
            </div>
            <div className={styles.upperLayer}>
                <section className={styles.musicBtn}>
                    <BackgroundMusic musicOn={musicOn} source={bgMusicUrl} onClick={() => { setMusicOn(old => !old) }}></BackgroundMusic>
                </section>
            </div>
        </main >
        <footer>
        </footer>
    </div >;
}

export default ArtTemp1;