import type { AppProps } from 'next/app'

import '../frontend/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div id="serlo-root">
      <Component {...pageProps} />
    </div>
  )
}
