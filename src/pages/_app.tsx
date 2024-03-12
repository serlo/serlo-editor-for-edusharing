import type { AppProps } from 'next/app'

import 'katex/dist/katex.min.css'
import '../frontend/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
