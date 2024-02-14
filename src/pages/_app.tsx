import type { AppProps } from 'next/app'

import '@serlo/editor/dist/editor-tailwind.css'
import 'katex/dist/katex.min.css'
import '../frontend/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
