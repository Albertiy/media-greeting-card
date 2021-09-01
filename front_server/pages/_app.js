import { SnackbarContent, SnackbarProvider } from 'notistack'
import '../styles/globals.css'
import '../styles/global.scss'

function MyApp({ Component, pageProps }) {
  return (
    <SnackbarProvider>
      <Component {...pageProps} />
    </SnackbarProvider>
  )
}

export default MyApp
