import { Button, Input, Layout, Space } from 'antd'
import { useSnackbar } from 'notistack'
import { useRef, useState } from 'react'
import useCode from '../../src/hook/useCode'
import styles from './access_pwd.module.scss'
import GlobalSettings from '../../src/setting/global'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as fileService from '../../src/service/file_service'

export default function accessPwd() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
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
            login()
        }
    }

    /**
     * 登录
     */
    function login(code, pwd) {
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
        } finally {
            setShowAlertDialog(false)
        }
    }

    return (
        <Layout className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('访问')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Space direction="vertical" size="large" className={styles.form}>
                <label className={styles.label}>设置访问密码：</label>
                <Input.Password className={styles.input} placeholder="密码" size="large" value={pwd} onChange={(e) => setPwd(e.target.value)} maxLength={10} />
                <Button type="primary" block={true} className={styles.btn} size="large" onClick={loginBtnClicked}>确认</Button>
            </Space>
        </Layout>
    )
}
