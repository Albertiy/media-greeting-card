import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import FloatSidebar from '../src/component/float_sidebar/FloatSidebar';
import MainImage from '../src/component/main_image/MainImage';
import useCode from '../src/hook/useCode';
import Article from '../src/model/article';
import { SkeletonTemplate } from '../src/model/skeleton_template';
import Uploadfiles from '../src/model/uploadfiles';
import * as ArtService from '../src/service/art_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1_manage.module.scss';
import { getFile } from '../src/service/file_service';

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

export default function At1Manage() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { code, routerRefreshCount, routerLoaded } = useCode()
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const [bgImageUrl, setBgImageUrl] = useState(defaultBgImageUrl);
    const [musicOn, setMusicOn] = useState(false);
    const [bgMusicUrl, setBgMusicUrl] = useState(defaultBgMusicUrl);
    const [p1, setP1] = useState(defaultP1)

    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** 初始化skeleton，加载内容 */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            // 加载背景图片
            updateEles(skeleton);
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

    function updateEles(skele) {
        if (skele.customBgImageId) {

        }
        else if (skele.bgImageId) {
            ArtService.getBgImage(skele.bgImageId).then((result) => {
                console.log('[bgimage url]: %o', result)
                setBgImageUrl(getFile(result))
            }).catch((err) => {
                console.log(err)
            });
        }
        // 加载背景音乐
        if (skele.bgMusicId) {
            ArtService.getMusic(skele.bgMusicId).then((result) => {
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

        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{(skeleton && skeleton.title) || GlobalSettings.siteTitle('模板定制')}</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
            </header>
            <main className={styles.main} style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}>
                <div className={styles.contentLayer}>
                    <section className={styles.mainImageContainer}>
                        <MainImage src={skeleton && skeleton.imageList && skeleton.imageList[0] || ''}></MainImage>
                    </section>
                    <section className={styles.editContainer}>
                    </section>
                    <section className={styles.interactiveMessageContainer}>
                    </section>
                </div>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtn}>
                        <FloatSidebar onItemClicks={[() => { }, () => { }]}></FloatSidebar>
                    </section>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    )
}
