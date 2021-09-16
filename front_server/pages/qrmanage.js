import Head from 'next/head';
import AlertDialog from '../src/component/alert-dialog';
import { useSnackbar } from 'notistack';

import { DatePicker as AntDatePicker } from 'antd';
const { RangePicker } = AntDatePicker;
import { Table as AntTable } from 'antd';

import GlobalSettings from '../src/setting/global';
import styles from '../styles/qrmanage.module.scss';

function QrManagePage(props) {

    console.log(GlobalSettings)

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
                </div>
                <div className={styles.tableContainer}>
                    <AntTable className={styles.table} />
                </div>
            </div>
        </main>
        <footer>
        </footer>
    </div>;
}

export default QrManagePage;