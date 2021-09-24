import { mdiDownload } from '@mdi/js';
import Icon from "@mdi/react";
import { DatePicker as AntDatePicker, Table as AntTable, Button } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import AlertDialog from '../src/component/alert-dialog';
import ModelLoading from '../src/component/model_loading';
import GenerateRecords from '../src/model/generaterecords';
import GlobalSettings from '../src/setting/global';
import styles from '../styles/qrmanage.module.scss';
const { RangePicker } = AntDatePicker;

/** @type{GenerateRecords[]} */
const defaultRecordsList = [];
const defaultRangeEndTime = new Date();
const defaultRangeStartTime = new Date().setDate(defaultRangeEndTime.getDate() - 30);
const defaultIsLoading = false;
const defaultDialog = { open: false, title: '提示', content: '确认' };



function QrManagePage(props) {

    const [rangeStartTime, setRangeStartTime] = useState(defaultRangeStartTime);
    const [rangeEndTime, setRangeEndTime] = useState(defaultRangeEndTime);
    const [recordsList, setRecordsList] = useState(defaultRecordsList);
    const [isLoading, setIsLoading] = useState(defaultIsLoading);
    const [showDialog, setShowDialog] = useState(defaultDialog.open);
    const [dialogTitle, setDialogTitle] = useState(defaultDialog.title);
    const [dialogContent, setDialogContent] = useState(defaultDialog.content);
    let defaultHandleClose = function (ok) { setShowDialog(false) };
    const [dialogHandleClose, setDialogHandleClose] = useState(defaultHandleClose);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();



    const tableColumns = [
        {
            title: '',
            width: 1,
            align: 'center',
            render: (text, record, index) => `${index + 1}`,
        }, {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 100,
            align: 'center',
            render: (text, record, index) => { return dayjs(text).format('YYYY-MM-DD HH:mm:ss') }
        }, {
            title: '生成数量',
            dataIndex: 'count',
            key: 'count',
            width: 50,
            align: 'center',
        }, {
            title: '首位序号',
            dataIndex: 'first',
            key: 'first',
            width: 150,
            align: 'center',
        }, {
            title: '末位序号',
            dataIndex: 'latest',
            key: 'latest',
            width: 150,
            align: 'center',
        }, {
            title: '操作',
            key: 'operation',
            width: 100,
            fixed: 'right',
            render: (value, row, index) => {
                return (
                    <div className={styles.button_bar}>
                        <Button type="primary" shape="round" size='middle' onClick={() => {
                            enqueueSnackbar('下载', { variant: 'info', autoHideDuration: 2000 })
                        }}><div className={styles.button}><Icon path={mdiDownload} size={0.75}></Icon>修改</div></Button>
                    </div>
                )
            }
        }
    ]

    const tablePagination = {
        position: 'bottomRight',
        pageSizeOptions: [10, 20, 50],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `共 ${total} 项，当前显示 ${range[0]}-${range[1]} 项`,
        locale: {
            items_per_page: " / 页",
            jump_to: "跳转至",
            jump_to_confirm: "确认",
            next_3: "下 3 页",
            next_5: "下 5 页",
            next_page: "下一页",
            Page: "",
            prev_3: "上 3 页",
            prev_5: "上 5 页",
            prev_page: "上一页",
        }
        // 这部分需要状态
        // total: this.state.tableResultCount,
        // current: this.state.tablePageNumber,
        // pageSize: this.state.tableMaxRows,
        // onChange: this.onPaginationChange,   // 已经有了 onTableChange，此项无效
    }

    /**
     * 初始化方法
     */
    function init() {
        const mockData = [
            new GenerateRecords(1, 199, 'xxxxxxx-1-199-1', 'xxxxxxx-1-199-199', '/api/axxds/dfasf', new Date()),
            new GenerateRecords(2, 199, 'xxxxxxx-1-199-1', 'xxxxxxx-1-199-199', '/api/axxds/dfasf', new Date()),
            new GenerateRecords(3, 199, 'xxxxxxx-1-199-1', 'xxxxxxx-1-199-199', '/api/axxds/dfasf', new Date()),
            new GenerateRecords(4, 199, 'xxxxxxx-1-199-1', 'xxxxxxx-1-199-199', '/api/axxds/dfasf', new Date()),
            new GenerateRecords(5, 199, 'xxxxxxx-1-199-1', 'xxxxxxx-1-199-199', '/api/axxds/dfasf', new Date()),
        ];
        setRecordsList(mockData);
    }

    useEffect(() => {
        init();
    }, [])

    useEffect(() => {

    }, [rangeStartTime, rangeEndTime])

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

    return <div>
        <Head>
            <title>{GlobalSettings.siteTitle('二维码生成')}</title>
            <meta charSet='utf-8' />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header>
        </header>
        <main>
            <div className={styles.container}>
                <div className={styles.controlPanel}>
                    <div className={styles.controlRow}>
                        <label>时间：</label><RangePicker id="timeFilter" showTime value={[rangeStartTime ? moment(rangeStartTime) : null, rangeEndTime ? moment(rangeEndTime) : null]} onChange={(dates, dateStrings) => {
                            console.log('时间选择器： dates: %o dateStrings: %o', dates, dateStrings)
                            if (dates) {
                                setRangeStartTime(dates[0].toDate())
                                setRangeEndTime(dates[1].toDate())
                            } else {
                                setRangeStartTime(null)
                                setRangeEndTime(null)
                            }
                        }} />
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <AntTable className={styles.table} rowKey="id" columns={tableColumns} dataSource={recordsList} loading={isLoading} content pagination={{ ...tablePagination }} />
                </div>
            </div>
        </main>
        <footer>
        </footer>
        {isLoading && <ModelLoading />}
    </div>;
}

export default QrManagePage;