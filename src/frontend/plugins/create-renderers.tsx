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
      ...pluginRenderers.map((pluginRenderer) => {
        // If geogebra, wrap the renderer inside a aspect-ratio 16/9 block so that the geogebra embed gets scaled correctly. In frontend this is implicitly done by PrivacyWrapper, which we do not have here.
        if (pluginRenderer.type === EditorPluginType.Geogebra) {
          return {
            type: EditorPluginType.Geogebra,
            renderer: (props) => {
              return (
                <div className="relative pb-[56.2%]">
                  <pluginRenderer.renderer {...props} />
                </div>
              )
            },
          }
        }
        // Else, return renderer without modification
        return pluginRenderer
      }),
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
