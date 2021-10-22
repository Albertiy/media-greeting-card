import { BulbOutlined, CarryOutOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import { mdiMenu } from '@mdi/js'
import Icon from '@mdi/react'
import { Button, Divider, Layout, Menu } from 'antd'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import GlobalSettings from '../../setting/global'
import styles from './FloatSidebar.module.scss'

const Sider = Layout.Sider;
const tokenName = GlobalSettings.modifyToken || 'modify_token';

function FloatSidebar(props) {
    const router = useRouter();
    const [show, setShow] = useState(false)
    const [cookies, setCookie, removeCookie] = useCookies([tokenName]);
    /** @type {function[]} */
    let onItemClicks = props.onItemClicks || [];
    /** @type {function} */
    let onQuitClick = props.onQuitClick;

    useEffect(() => {
        console.log('sidebar code: %o', props.code)
        if (props.code) {
            onItemClicks = [
                function () { },
                function () { },
                function () { }
            ];
            onQuitClick = () => {

            }
        }
    }, [props.code])


    function editCode() {
        if (props.code) {
            router.push({ pathname: '/at_1_manage', query: { code: props.code } })
        } else {
            console.log('code 尚未加载')
        }
        console.log('编辑二维码')
    }

    function changePwd() {
        if (props.code) {
            router.push({ pathname: '/login_pwd', query: { code: props.code } })
        } else {
            console.log('code 尚未加载')
        }
        console.log('修改密码')
    }

    function showTips() {
        if (props.code) {
            router.push({ pathname: '/tips', query: { code: props.code } })
        } else {
            console.log('code 尚未加载')
        }
        console.log('温馨提示')
    }

    function logout() {
        if (props.code) {
            console.log(`${tokenName}: %o`, cookies[tokenName])
            removeCookie(tokenName, { path: '/' })
            router.push({ pathname: '/at_1', query: { code: props.code } })
        } else {
            console.log('code 尚未加载')
        }
        console.log('退出')
    }


    return (
        <div className={styles.iconContainer}>
            <Button className={styles.toggleBtn} title="切换侧边栏显示隐藏"
                onClick={() => { console.log('显示侧边栏！'); setShow(true); }} >
                <Icon className={styles.toggleIcon} path={mdiMenu} size={1.0} />
            </Button>
            <div className={styles.container} style={show ? { visibility: 'visible', opacity: '100%' } : { visibility: 'collapse', opacity: '0%' }} onClick={() => {
                console.log('隐藏侧边栏！'); setShow(false);
            }} >
                <Sider className={styles.sider} onClick={(e) => { e.stopPropagation() }}>
                    <div className={styles.title}>欢迎</div>
                    {/* selectable={false} */}
                    <Menu className={styles.menu} mode="inline" theme="dark">
                        {/* antd不支持其他的Icon组件 <Icon path={mdiLock} size="0.8" style={{ color: '#fff' }} /> <SlackOutlined /> */}
                        <Menu.Item key="1" icon={<BulbOutlined />} onClick={editCode}>编辑二维码</Menu.Item>
                        <Menu.Item key="2" icon={<EditOutlined />} onClick={changePwd}>修改密码</Menu.Item>
                        <Menu.Item key="3" icon={<CarryOutOutlined />} onClick={showTips}>温馨提示</Menu.Item>
                    </Menu>
                    <Divider className={styles.divider}></Divider>
                    <div className={styles.quitBtn}>
                        <Button type="link" size={'large'} onClick={logout} ><ExportOutlined />退出</Button>
                    </div>
                </Sider>
            </div>
        </div>
    )
}

FloatSidebar.propTypes = {
    code: PropTypes.string
}

export default FloatSidebar;