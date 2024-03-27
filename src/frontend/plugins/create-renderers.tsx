import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'
import Link from 'next/link'

export const customPluginsRenderers = [
  { type: 'edusharingAsset', renderer: EdusharingAssetStaticRenderer },
  { type: 'serloInjection', renderer: SerloInjectionStaticRenderer },
]

export const customRenderers = {
  linkRenderer: ({ href, children }) => {
    return (
      <>
        <Link
          className="serlo-link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </Link>
      </>
    )
  },
}
