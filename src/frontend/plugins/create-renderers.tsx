import {
  EditorPluginType,
  createRenderers as createBasicRenderers,
} from '@serlo/editor'

import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'
import Link from 'next/link'

export function createRenderers(): ReturnType<typeof createBasicRenderers> {
  const { pluginRenderers, ...otherRenderers } = createBasicRenderers()

  return {
    pluginRenderers: [
      // edu-sharing specific
      { type: 'edusharingAsset', renderer: EdusharingAssetStaticRenderer },
      {
        type: 'serloInjection',
        renderer: SerloInjectionStaticRenderer,
      },
      ...pluginRenderers,
    ],
    ...otherRenderers,
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
}
