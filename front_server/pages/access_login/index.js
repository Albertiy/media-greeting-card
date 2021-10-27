import { Button, Input, Layout, Space } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import useCode from '../../src/hook/useCode'
import ModelLoading from '../../src/component/model_loading'
import * as fileService from '../../src/service/file_service'
import GlobalSettings from '../../src/setting/global'
import styles from './access_login.module.scss'

export default function AccessLogin() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const { code } = useCode();
    const [pwd, setPwd] = useState('')

    /**
     * 点击登录按钮
     * @param {*} event 
     */
    function loginBtnClicked(event) {
        if (!code)
            enqueueSnackbar('编码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (pwd == undefined || pwd == '')
            enqueueSnackbar('密码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else {
            access()
        }
    }

    /**
     * 登录
     */
    function access() {
        console.log('code: %o, pwd: %o', code, pwd)
        try {
            setIsLoading(true)
            // 后台请求
            fileService.access(code, pwd).then(res => {
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
                <title>{GlobalSettings.siteTitle('访问')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Layout className={styles.pwdContainer}>
                    <Space direction="vertical" size="large" className={styles.form}>
                        <label className={styles.label}>请输入访问密码：</label>
                        <Input.Password className={styles.input} placeholder="密码" size="large" value={pwd} onChange={(e) => setPwd(e.target.value)} maxLength={10} />
                        <Button type="primary" block={true} className={styles.btn} size="large" onClick={loginBtnClicked}>确认</Button>
                    </Space>
                    {isLoading && <ModelLoading />}
                </Layout>
                <div className={styles.upperLayer}>
                    {/* <section className={styles.menuBtnContainer}>
                        <FloatSidebar code={code}></FloatSidebar>
                    </section> */}
                </div>
            </main>
        </div>
    )
}
