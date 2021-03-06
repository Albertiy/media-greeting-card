import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import authenticatedRoute from '../src/component/authenticated_route/AuthenticatedRoute';
import FloatSidebar from '../src/component/float_sidebar/FloatSidebar';
import ImageBtn from '../src/component/image_btn/ImageBtn';
import MainImage from '../src/component/main_image/MainImage';
import ModelLoading from '../src/component/model_loading';
import useCode from '../src/hook/useCode';
import Article from '../src/model/article';
import Uploadfiles from '../src/model/uploadfiles';
import * as ArtService from '../src/service/art_service';
import * as FileService from '../src/service/file_service';
import { getFile } from '../src/service/file_service';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/at_1_manage.module.scss';

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
const tokenName = GlobalSettings.modifyToken || 'modify_token';

function At1Manage() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const { code, routerRefreshCount, routerLoaded } = useCode()
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const [bgImageUrl, setBgImageUrl] = useState(defaultBgImageUrl);
    const [musicOn, setMusicOn] = useState(false);
    const [bgMusicUrl, setBgMusicUrl] = useState(defaultBgMusicUrl);
    const [p1, setP1] = useState(defaultP1)
    const [loading, setLoading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);

    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** ?????????skeleton??????????????? */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            // ??????????????????
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
            enqueueSnackbar(error.toString(), { variant: 'error', autoHideDuration: 2000 })
        }
    }

    function getDefaultBg(bgImageId) {
        ArtService.getBgImage(bgImageId).then((result) => {
            console.log('[bgimage url]: %o', result)
            setBgImageUrl(FileService.getFile(result))
        }).catch((err) => {
            console.log(err)
        });
    }

    function updateEles(skele) {
        if (skele.customBgImageId) {
            ArtService.getImage(skele.customBgImageId).then((result) => {
                console.log('[customBgImage url]: %o', result.path)
                if (result.path) {
                    let src = getFile(result.path)
                    src = src.replace('\\', '/')    // ??????????????????style??????????????????
                    setBgImageUrl(src)
                } else {
                    getDefaultBg(skele.bgImageId);
                }
            }).catch((err) => {
                getDefaultBg(skele.bgImageId);
            });
        } else if (skele.bgImageId) {
            getDefaultBg(skele.bgImageId);
        }
        // ??????????????????
        if (skele.bgMusicId) {
            ArtService.getMusic(skele.bgMusicId).then((result) => {
                console.log('[bgmusic url]: %o', result)
                setBgMusicUrl(FileService.getFile(result))
            }).catch((err) => {
                console.log(err)
            });
        }
        // ????????????
        // if (skeleton.title) { }
        // ????????????
        if (skeleton.textList && skeleton.textList[0]) {
            setP1(skeleton && skeleton.textList && skeleton.textList[0]);
        }
        // ????????????
        if (skeleton.imageList && skeleton.imageList[0]) {
            ArtService.getImage(skeleton.imageList[0]).then((result) => {
                let src = getFile(result.path)
                setPreviewSrc(src)
            }).catch((err) => {
                enqueueSnackbar('' + err, { variant: 'warning', autoHideDuration: 2000 })
            })
        }
    }

    function setText() {
        // ?????????????????????
        router.push({ pathname: '/update_text', query: { code } })
    }

    function chooseMainImg() {
        // ????????????
        router.push({ pathname: '/update_image', query: { code } })
    }

    function chooseBgImg() {
        // ?????????????????????????????????
        router.push({ pathname: '/update_bg_image', query: { code } })
    }

    function chooseBgMusic() {
        // TODO ??????????????????
        router.push({ pathname: '/update_bg_music', query: { code } })
    }

    function preview() {
        if (code)
            router.push({ pathname: '/at_1', query: { code } })
    }

    function encrypt() {
        console.log(record.needAccessPwd)
        if (code && record)
            if (!record.needAccessPwd) {
                console.log('????????????')
                router.push({ pathname: '/access_pwd', query: { code } })
            } else {
                console.log('????????????')
                FileService.setAccessPwd(code, null).then((result) => {
                    enqueueSnackbar('??????????????????', { variant: 'success', autoHideDuration: 2000 })
                    // setRecord(old => { let temp = old; temp.needAccessPwd = !old.needAccessPwd; return temp; })
                    getInfoByCode(code);
                }).catch((err) => {
                    enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
                });
            }
    }

    function lock() {
        if (record) {
            setLoading(true)
            FileService.lock(code, !record.isLocked).then((result) => {
                console.log('lock result: %o', result)
                enqueueSnackbar(result.toString() + `, ????????????????????? ${record.isLocked ? '??????' : '??????'} ??????`, { variant: 'success', autoHideDuration: 2000 })
                record.isLocked = !record.isLocked;
            }).catch((err) => {
                console.log('lock err: %o', err)
                enqueueSnackbar(err.toString(), { variant: 'error', autoHideDuration: 2000 })
            }).finally(() => {
                setLoading(false)
            });
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{(skeleton && skeleton.title) || GlobalSettings.siteTitle('????????????')}</title>
                <meta charSet='utf-8' />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
            </header>
            <main className={styles.main} style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}>
                <div className={styles.bgcover}></div>
                <div className={styles.contentLayer}>
                    <section className={styles.mainImageContainer}>
                        <MainImage src={previewSrc}></MainImage>
                    </section>
                    <section className={styles.editContainer}>
                        <ImageBtn title="??????" src="img/article_btn/note.png" imgStyle={{ transform: 'translate(3px, 0px)' }}
                            onClick={setText}></ImageBtn>
                        <ImageBtn title="??????" src="img/article_btn/image.png"
                            onClick={chooseMainImg}></ImageBtn>
                        <ImageBtn title="??????" src="img/article_btn/renovation.png"
                            onClick={chooseBgImg}></ImageBtn>
                        <ImageBtn title="??????" src="img/article_btn/music.png"
                            onClick={chooseBgMusic}></ImageBtn>
                        <ImageBtn title="??????" src="img/article_btn/preview.png"
                            onClick={preview}></ImageBtn>
                        <ImageBtn title={record && record.needAccessPwd ? "?????????" : "??????"} src="img/article_btn/encrypted.png"
                            onClick={encrypt}></ImageBtn>
                        <ImageBtn title={record && record.isLocked ? "????????????" : "????????????"} src="img/article_btn/browser.png"
                            onClick={lock}></ImageBtn>
                    </section>
                    <section className={styles.interactiveMessageContainer}>
                    </section>
                </div>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtnContainer}>
                        <FloatSidebar code={code} managePage={'at_1_manage'} previewPage={'at_1'} ></FloatSidebar>
                    </section>
                </div>
            </main>
            <footer>
            </footer>
            {loading && <ModelLoading></ModelLoading>}
        </div>
    )
}

export default authenticatedRoute(At1Manage, { tokenName: tokenName });