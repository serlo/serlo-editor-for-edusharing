import { EditorPluginType } from '@serlo/editor'
import Link from 'next/link'

import IconImage from '../assets/plugin-icons/icon-image.svg'
import IconInjection from '../assets/plugin-icons/icon-injection.svg'

import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'
import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'

export function createPluginsConfig({ ltik }: { ltik: string }) {
  return {
    basicPluginsConfig,
    customPlugins: createCustomPlugins({ ltik }),
    customRenderers,
  }
}

const basicPluginsConfig = {
  enableTextAreaExercise: true,
  allowImageInTableCells: false,
  exerciseVisibleInSuggestion: true,
  allowedChildPlugins: [
    EditorPluginType.Text,
    EditorPluginType.Equations,
    EditorPluginType.Highlight,
    'edusharingAsset',
  ],
  multimediaConfig: {
    explanation: {
      plugin: EditorPluginType.Rows,
      config: {
        allowedPlugins: [EditorPluginType.Text],
      },
    },
    allowedPlugins: ['edusharingAsset'],
  },
}

function createCustomPlugins({ ltik }: { ltik: string }) {
  return [
    {
      type: 'serloInjection',
      plugin: createSerloInjectionPlugin(),
      renderer: SerloInjectionStaticRenderer,
      visibleInSuggestions: true,
      icon: <IconInjection />,
    },
    {
      type: 'edusharingAsset',
      plugin: createEdusharingAssetPlugin({ ltik }),
      renderer: EdusharingAssetStaticRenderer,
      visibleInSuggestions: true,
      icon: <IconImage />,
    },
  ]
}

const customRenderers = {
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
