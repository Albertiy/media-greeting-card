import { Button, Input, Layout, Space } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useRef, useState } from 'react'
import ModelLoading from '../../src/component/model_loading'
import useCode from '../../src/hook/useCode'
import * as fileService from '../../src/service/file_service'
import GlobalSettings from '../../src/setting/global'
import styles from './login_pwd.module.scss'

export default function loginPwd() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const { code } = useCode();
    const [oldPwd, setOldPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')

    /**
     * 点击登录按钮
     * @param {*} event 
     */
    function confirmBtnClicked(event) {
        if (!code)
            enqueueSnackbar('编码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (oldPwd == undefined || oldPwd == '')
            enqueueSnackbar('原密码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (newPwd == undefined || newPwd == '')
            enqueueSnackbar('新密码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else {
            login()
        }
    }

    /**
     * 登录
     */
    function login() {
        console.log('code: %o, oldPwd: %o, newPwd: %o', code, oldPwd, newPwd)
        try {
            setIsLoading(true)
            // 后台请求
            fileService.changePwd(code, oldPwd, newPwd).then(res => {
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
        <Layout className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('修改管理密码')}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Space direction="vertical" size="large" className={styles.form}>
                <label className={styles.label}>修改管理密码：</label>
                <Input.Password className={styles.input} placeholder="原密码" size="large" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} maxLength={20} />
                <Input.Password className={styles.input} placeholder="新密码" size="large" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} maxLength={20} />
                <Button type="primary" block={true} className={styles.btn} size="large" onClick={confirmBtnClicked}>确认</Button>
            </Space>
            {isLoading && <ModelLoading />}
        </Layout>
    )
}
