import { CheckOutlined, PauseCircleOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import { Button } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import authenticatedRoute from '../../src/component/authenticated_route/AuthenticatedRoute';
import FloatSidebar from '../../src/component/float_sidebar/FloatSidebar';
import ImageBtn from '../../src/component/image_btn/ImageBtn';
import MainImage from '../../src/component/main_image/MainImage';
import ModelLoading from '../../src/component/model_loading';
import useCode from '../../src/hook/useCode';
import Article from '../../src/model/article';
import Music from '../../src/model/music';
import { SkeletonTemplate } from '../../src/model/skeleton_template';
import Uploadfiles from '../../src/model/uploadfiles';
import * as ArtService from '../../src/service/art_service';
import * as FileService from '../../src/service/file_service';
import { getFile } from '../../src/service/file_service';
import GlobalSettings from '../../src/setting/global';
import styles from './update_bg_music.module.scss';

/**@type{Uploadfiles} */
const defaultRecord = null;
/** @type{Article} */
const defaultArticle = null;
/** @type{SkeletonTemplate[1]} */
const defaultSkeleton = null;
/** @type{string} */
const defaultBgImageUrl = null;
/** @type{Music} */
const defaultPreviewMusic = null;
const defaultP1 = '';
const tokenName = GlobalSettings.modifyToken || 'modify_token';
/** @type {Music[]} */
const defualtMusicList = [];
/** @type {HTMLAudioElement} */
const defaultAudioElement = null;
/** @type {AudioContext} */
const defaultAudioContext = null;

function UpdateBgMusic() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();
    const { code, routerRefreshCount, routerLoaded } = useCode()
    const [record, setRecord] = useState(defaultRecord);
    const [article, setArticle] = useState(defaultArticle);
    const [skeleton, setSkeleton] = useState(defaultSkeleton);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [musicList, setMusicList] = useState(defualtMusicList)
    const [previewMusic, setPreviewMusic] = useState(defaultPreviewMusic);
    const [musicOn, setMusicOn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState(null);
    const audioElement = useRef(defaultAudioElement);
    const audioContext = useRef(defaultAudioContext);

    function initAudio() {
        if (audioElement.current) {
            let audioEle = audioElement.current;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            /** @type{AudioContext} */
            const audioCtx = new AudioContext();
            const track = audioCtx.createMediaElementSource(audioEle);
            const panner = audioCtx.createStereoPanner();
            track.connect(panner).connect(audioCtx.destination);
            if (audioCtx.state == 'suspended')
                audioCtx.resume()
            console.log('audioCtx.state: %o', audioCtx.state)
            audioContext.current = audioContext;
            audioEle.addEventListener('ended', (ev) => {
                setMusicOn(false)
            })
        }
    }

    useEffect(() => {
        initAudio();
        ArtService.getMusicList().then((result) => {
            console.log('MusicList: %o', result)
            setMusicList(result)
        }).catch((err) => {
            enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
        });
    }, [])

    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** 初始化skeleton，加载内容 */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            console.log('bgMusic: %o', skeleton.bgMusicId)
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
     * 预览背景音乐，切换播放和暂停状态
     * @param {Music} value
     */
    function previewBtnClicked(value) {
        console.log('点击了试听按钮 %o', value)
        if (value) {
            // 尚未初始化源，或不是同一首歌，更新源，并播放
            if (previewMusic == defaultPreviewMusic || previewMusic.id != value.id) {
                setMusicSource(value)
                setMusicOn(val => { setMusicPlay(true); return true })
            } else {    // 否则切换播放状态
                setMusicOn(val => { setMusicPlay(!val); return !val })
            }
        }
    }

    /**
     * 更新播放源
     * @param {Music} value 
     */
    function setMusicSource(value) {
        if (audioElement.current) {
            let audioEle = audioElement.current;
            setPreviewMusic(value)
            let src = getFile(value.path)
            audioEle.src = src;
            console.log('播放源：%o', audioEle.src)
        }
        // setSource(old => { return src })
    }

    /**
     * 播放或停止播放
     * @param {boolean} state 
     */
    function setMusicPlay(state) {
        if (audioElement.current) {
            let audioEle = audioElement.current;
            if (state) {
                audioEle.load();
                audioEle.play().then((result) => {
                    console.log('开始播放...')
                }).catch((err) => {
                    console.log('播放失败...')
                });
            }
            else
                audioEle.pause()
        }
    }


    /**
     * 设置背景音乐id
     * @param {Music} value
     */
    function setBtnClicked(value) {
        console.log('点击了设置背景音乐按钮 %o', value)
        if (value) {
            if (skeleton && skeleton.bgMusicId && skeleton.bgImageId == value.id) {
                enqueueSnackbar('当前已选择此背景音乐', { variant: 'info', autoHideDuration: 2000 })
            } else {
                set(code, value.id)
            }
        }
    }

    /**
     * 清除背景音乐
     */
    function clearBtnClicked() {
        console.log('点击了清除背景音乐按钮')
        if (skeleton && !skeleton.bgMusicId) {
            enqueueSnackbar('尚未选择背景音乐', { variant: 'info', autoHideDuration: 2000 })
        } else {
            clear(code)
        }
    }

    function set(code, id) {
        // 设置背景音乐
        setLoading(true)
        ArtService.updateBgMusic(code, id).then((result) => {
            enqueueSnackbar('' + result, { variant: 'success', autoHideDuration: 2000 })
            if (window.history.length > 1) {
                router.back();
            } else
                router.push({ pathname: '/entry', query: { code } });
        }).catch((err) => {
            enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
        }).finally(() => {
            setLoading(false)
        });
    }

    function clear(code) {
        setLoading(true)
        // 移除当前选择的背景音乐
        ArtService.clearBgMusic(code).then((result) => {
            enqueueSnackbar('' + result, { variant: 'success', autoHideDuration: 2000 })
            if (window.history.length > 1) {
                router.back();
            } else
                router.push({ pathname: '/entry', query: { code } });
        }).catch((err) => {
            enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
        }).finally(() => {
            setLoading(false)
        });
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
            <main className={styles.main}>
                <div className={styles.contentLayer}>
                    <audio controls={false} ref={audioElement} preload="none"></audio>
                    <section className={styles.labelContainer}>
                        <label className={styles.label}>选择背景音乐</label>
                    </section>
                    <section className={styles.listContainer}>
                        {musicList ? musicList.map(val => {
                            return <div className={styles.listItem} key={val.id}>
                                <label className={styles.itemName}>{val.name}</label>
                                <div className={styles.listBtnGroup}>
                                    <Button className={styles.listBtn} type={'link'} shape={'round'} icon={!musicOn || !(previewMusic && previewMusic.id == val.id) ? <PlayCircleTwoTone /> : <PauseCircleOutlined />} onClick={() => previewBtnClicked(val)}>试听</Button>
                                    <Button className={styles.listBtn} type={'link'} shape={'round'} icon={<CheckOutlined />} onClick={() => setBtnClicked(val)}>设置</Button>
                                </div>
                            </div>
                        }) : (<div className={styles.emptyList}>
                            背景音乐列表为空
                        </div>)}
                    </section>
                    <section className={styles.btnContainer}>
                        <Button type="link" block={true} className={styles.linkBtn} size="small" onClick={clearBtnClicked} disabled={!dataLoaded}>&gt; &gt; 移除背景音乐</Button>
                    </section>
                </div>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtnContainer}>
                        <FloatSidebar code={code} managePage={'at_1_manage'} previewPage={'at_1'} ></FloatSidebar>
                    </section>
                </div>
            </main >
            <footer>
            </footer>
            {loading && <ModelLoading></ModelLoading>}
        </div >
    );
}

export default authenticatedRoute(UpdateBgMusic, { tokenName: tokenName });