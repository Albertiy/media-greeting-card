import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Upload } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import AlertDialog from '../../src/component/alert-dialog';
import authenticatedRoute from '../../src/component/authenticated_route/AuthenticatedRoute';
import FloatSidebar from '../../src/component/float_sidebar/FloatSidebar';
import MainImage from '../../src/component/main_image/MainImage';
import ModelLoading from '../../src/component/model_loading';
import useCode from '../../src/hook/useCode';
import Article from '../../src/model/article';
import { SkeletonTemplate } from '../../src/model/skeleton_template';
import Uploadfiles from '../../src/model/uploadfiles';
import * as ArtService from '../../src/service/art_service';
import * as fileService from '../../src/service/file_service';
import { getFile } from '../../src/service/file_service';
import GlobalSettings from '../../src/setting/global';
import * as Tools from '../../src/tool/tools';
import styles from './update_bg_image.module.scss';

const tokenName = GlobalSettings.modifyToken;
/**@type{Uploadfiles} */
const defaultRecord = null;
/** @type{Article} */
const defaultArticle = null;
/** @type{SkeletonTemplate[1]} */
const defaultSkeleton = null;

/** 最大图片文件大小 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const defaultDialog = { open: false, title: '提示', content: '确认' };

function UpdateImage() {
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
    const [mainSrc, setMainSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);

    const [showDialog, setShowDialog] = useState(defaultDialog.open);
    const [dialogTitle, setDialogTitle] = useState(defaultDialog.title);
    const [dialogContent, setDialogContent] = useState(defaultDialog.content);
    let defaultHandleClose = function (ok) { setShowDialog(false) };
    const [dialogHandleClose, setDialogHandleClose] = useState(defaultHandleClose);

    useEffect(() => {
        if (code)
            getInfoByCode(code);
    }, [code])

    /** 初始化skeleton，加载内容 */
    useEffect(() => {
        if (skeleton != defaultSkeleton) {
            console.log('title: %o, contentList %o', skeleton.title, skeleton.textList)
            if (skeleton.customBgImageId) {
                ArtService.getImage(skeleton.customBgImageId).then((result) => {
                    console.log(result)
                    if (result.path) {
                        let src = getFile(result.path)
                        src = src.replace('\\', '/')    // 解决反斜杠在style中会转义问题
                        setMainSrc(src)
                        setPreviewSrc(src)
                    }
                }).catch((err) => {
                    enqueueSnackbar('' + err, { variant: 'warning', autoHideDuration: 2000 })
                });
            }
        }
        setDataLoaded(true)
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
        else if (imageFile == null)
            enqueueSnackbar('请先选择图片', { variant: 'warning', autoHideDuration: 2000 })
        else {
            upload()
        }
    }

    /**
     * 上传
     */
    function upload() {
        console.log('code: %o, imageFile: %o', code, imageFile)
        try {
            setIsLoading(true)
            // 后台请求
            ArtService.updateCustomBgImage(code, imageFile).then(res => {
                enqueueSnackbar('' + res, { variant: 'success', autoHideDuration: 2000 })
                if (window.history.length > 1) {
                    // console.log('window.history: %o', window.history)
                    // console.log('document.referrer: %o', document.referrer)
                    router.back();
                } else
                    router.push({ pathname: '/entry', query: { code } });
            }).catch((err) => {
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
            }).finally(() => {
                setIsLoading(false)
            })
        } finally { }
    }

    /**
     * 删除当前图片
     */
    function clear() {
        console.log('[清空自定义背景图] code: %o', code)
        try {
            setIsLoading(true)
            // 后台请求
            ArtService.clearCustomBgImage(code).then(res => {
                enqueueSnackbar('清除自定义背景成功！' + res, { variant: 'success', autoHideDuration: 2000 })
                if (window.history.length > 1) {
                    router.back();
                } else
                    router.push({ pathname: '/entry', query: { code } });
            }).catch((err) => {
                console.log(err)
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
            }).finally(() => {
                setIsLoading(false)
            })
        } finally { }
    }

    function onFileChange(file, fileList) {
        if (file) {
            if (Tools.validImageType(file)) {
                if (file.size <= MAX_FILE_SIZE)
                    setImageFile(file);
                else {
                    enqueueSnackbar('图片尺寸过大，请选择小于10M的图片', { variant: 'warning', autoHideDuration: 2000 })
                }
            } else {
                enqueueSnackbar('选择的文件不是有效的图片格式', { variant: 'warning', autoHideDuration: 2000 })
            }
        }
        return false;   // 阻止自动上传
    }

    /** 选中的图片变化 */
    useEffect(() => {
        if (imageFile != null) {
            let reader = new FileReader();
            reader.readAsDataURL(imageFile)
            reader.onload = function (e) {
                setPreviewSrc(this.result)
            }
        } else {
            setPreviewSrc(mainSrc)
        }
    }, [imageFile])

    function clearBtnClicked() {
        if (skeleton && !skeleton.customBgImageId) {
            enqueueSnackbar('尚未上传自定义背景', { variant: 'info', autoHideDuration: 2000 })
        } else {
            showAlertDialog('注意', '将删除当前的自定义背景图片，是否继续？', (ok) => {
                if (ok) { clear() }
                else { }
                setShowDialog(false)
            })
        }
    }

    /**
     * 显示弹窗
     * @param {string} title 
     * @param {string} content 
     * @param {function} [handleClose] 
     */
    function showAlertDialog(title, content, handleClose) {
        setDialogTitle(value => title || defaultDialog.title)
        setDialogContent(value => content || defaultDialog.content)
        setDialogHandleClose(value => handleClose || defaultHandleClose)
        setShowDialog(true)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('自定义背景图片')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Layout className={styles.contentContainer}>
                    {/* <Space direction="vertical" size="large" className={styles.form}> */}
                    <div className={styles.form}>
                        <label className={styles.label}>自定义背景图片</label>
                        <label className={styles.inputLabel}>预览</label>
                        <section className={styles.mainImageContainer}>
                            <MainImage src={previewSrc}></MainImage>
                        </section>
                        <label className={styles.inputLabel}>选择图片</label>
                        <section className={styles.uploadContainer}>
                            <Upload beforeUpload={onFileChange} accept={Tools.imageFileTypes} maxCount={1} name={'mainImage'} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>点击选择图片</Button>
                            </Upload>
                        </section>
                        <label className={styles.notice}>注：不能上传违法信息，如有，将追究法律责任。</label>
                        <Button type="primary" block={true} className={styles.btn} size="large" onClick={confirmBtnClicked} disabled={!dataLoaded}>上传</Button>
                        <Button type="link" block={true} className={styles.linkBtn} size="small" onClick={clearBtnClicked} disabled={!dataLoaded}>&gt;&gt;删除自定义背景</Button>
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
            <AlertDialog open={showDialog} title={dialogTitle} content={dialogContent} handleClose={dialogHandleClose} />
        </div>
    )
}

export default authenticatedRoute(UpdateImage, { tokenName: tokenName });