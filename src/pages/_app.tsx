import type { AppProps } from 'next/app'

// import '@serlo/editor/dist/editor-tailwind.css'
import '../frontend/_tmp_styles.css'
import 'katex/dist/katex.min.css'
import '../frontend/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
