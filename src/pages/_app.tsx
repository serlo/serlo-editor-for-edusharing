import type { AppProps } from 'next/app'

import '../frontend/tailwind-default-styles.css'
import '@serlo/editor/dist/editor-tailwind.css'
import 'katex/dist/katex.min.css'
import '../frontend/tailwind-components-styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
