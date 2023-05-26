import type { AppProps } from 'next/app'
import 'katex/dist/katex.min.css'
import '../frontend/styles.css'
import '@frontend/src/assets-webkit/styles/serlo-tailwind.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
