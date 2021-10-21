import { BulbOutlined, CarryOutOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import { mdiMenu } from '@mdi/js'
import Icon from '@mdi/react'
import { Button, Divider, Layout, Menu } from 'antd'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styles from './FloatSidebar.module.scss'
const Sider = Layout.Sider;

function FloatSidebar(props) {

    const [show, setShow] = useState(false)
    /** @type {function[]} */
    const onItemClicks = props.onItemClicks || [];
    const onQuitClick = props.onQuitClick;
    // console.log('onItemClicks: %o', onItemClicks)
    // console.log('onQuitClick: %o', onQuitClick)

    return (
        <div className={styles.iconContainer}>
            <Button className={styles.toggleBtn} onClick={() => { console.log('显示侧边栏！'); setShow(true); }} title="切换侧边栏显示隐藏">
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
                        <Menu.Item key="1" icon={<BulbOutlined />} onClick={onItemClicks[0] || function () { console.log('编辑二维码') }}>
                            编辑二维码
                        </Menu.Item>
                        <Menu.Item key="2" icon={<EditOutlined />} onClick={onItemClicks[1] || function () { console.log('修改密码') }}>
                            修改密码
                        </Menu.Item>
                        <Menu.Item key="3" icon={<CarryOutOutlined />} onClick={onItemClicks[2] || function () { console.log('温馨提示') }}>
                            温馨提示
                        </Menu.Item>
                    </Menu>
                    <Divider className={styles.divider}></Divider>
                    <div className={styles.quitBtn}>
                        <Button type="link" size={'large'}><ExportOutlined onClick={onQuitClick || function () { console.log('退出') }} />退出</Button>
                    </div>
                </Sider>
            </div>
        </div>
    )
}

FloatSidebar.propTypes = {
    onItemClicks: PropTypes.arrayOf(PropTypes.func).isRequired,
    onQuitClick: PropTypes.func.isRequired,
}

export default FloatSidebar;