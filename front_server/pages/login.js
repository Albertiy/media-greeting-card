import { Button, Input, Layout, Space } from 'antd'
import { useSnackbar } from 'notistack'
import { useRef, useState } from 'react'
import useCode from '../src/hook/useCode'
import styles from '../styles/login.module.scss'
import GlobalSettings from '../src/setting/global'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function login() {
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
            ProductService.login(code, pwd).then(res => {
                enqueueSnackbar('' + res, { variant: 'success', autoHideDuration: 2000 })
                if (window.history.length > 1)
                    router.back();
                else
                    router.push('/management');
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
                <title>{GlobalSettings.siteTitle('登录')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Space direction="vertical" size="large" className={styles.form}>
                <label className={styles.label}>请输入管理密码：</label>
                <Input.Password className={styles.input} placeholder="密码" size="large" />
                <Button type="primary" block={true} className={styles.btn} size="large" onClick={loginBtnClicked}>登录</Button>
            </Space>
        </Layout>
    )
}
