import { createRenderers as createBasicRenderers } from '@serlo/editor'

import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'
import { ComponentProps } from 'react'
import { LinkRenderer } from '@serlo/editor/dist/packages/editor/src/plugin/helpers/editor-renderer'
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
    linkRenderer: ({ href, children }: ComponentProps<LinkRenderer>) => {
      return (
        <>
          <Link href={href}>{children}</Link>
        </>
      )
    },
  }
}
