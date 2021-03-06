import { mdiMenu, mdiArrowLeft } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button, Input, Layout, Space } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import ModelLoading from '../../src/component/model_loading'
import useCode from '../../src/hook/useCode'
import * as fileService from '../../src/service/file_service'
import GlobalSettings from '../../src/setting/global'
import styles from './login.module.scss'

export default function Login() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { code } = useCode();
    const [pwd, setPwd] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
    function login() {
        console.log('[login] code: %o, pwd: %o', code, pwd)
        try {
            setIsLoading(true)
            // 后台请求
            fileService.login(code, pwd).then(res => {
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
                <title>{GlobalSettings.siteTitle('登录')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Layout className={styles.pwdContainer}>
                    <Space direction="vertical" size="large" className={styles.form}>
                        <label className={styles.label}>请输入管理密码：</label>
                        <Input.Password className={styles.input} placeholder="密码" maxLength={20} size="large" onChange={(e) => { setPwd(e.target.value) }} />
                        <Button type="primary" block={true} className={styles.btn} size="large" onClick={loginBtnClicked}>登录</Button>
                    </Space>
                    {isLoading && <ModelLoading />}
                </Layout>
                <div className={styles.upperLayer}>
                    <section className={styles.menuBtnContainer}>
                        <Button className={styles.manageBtn} title="返回"
                            onClick={() => { console.log('返回'); router.push({ pathname: '/at_1', query: { code } }) }} >
                            <Icon path={mdiArrowLeft} size={1.0} />
                        </Button>
                    </section>
                </div>
            </main>
        </div>
    )
}
