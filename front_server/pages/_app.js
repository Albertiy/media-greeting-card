import { SnackbarContent, SnackbarProvider } from 'notistack'
import '../styles/globals.css'
import '../styles/global.scss'
import locale from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider locale={locale}>
      <SnackbarProvider>
        <Component {...pageProps} />
      </SnackbarProvider>
    </ConfigProvider>
  )
}

export default MyApp
