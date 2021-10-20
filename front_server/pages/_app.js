import { SnackbarContent, SnackbarProvider } from 'notistack'
import '../styles/globals.css'
import '../styles/global.scss'
import locale from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { CookiesProvider } from 'react-cookie'

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <ConfigProvider locale={locale}>
        <SnackbarProvider>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ConfigProvider>
    </CookiesProvider>
  )
}

export default MyApp
