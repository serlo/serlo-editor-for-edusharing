import { EditorPluginType } from '@serlo/editor'
import IconImage from '../assets/plugin-icons/icon-image.svg'
import IconInjection from '../assets/plugin-icons/icon-injection.svg'
import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'

export function createPluginsConfig(ltik: string) {
  return {
    basicPlugins: {
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
    },
    customPlugins: [
      {
        type: 'serloInjection',
        plugin: createSerloInjectionPlugin(),
        visibleInSuggestions: true,
        icon: <IconInjection />,
      },
      {
        type: 'edusharingAsset',
        plugin: createEdusharingAssetPlugin({ ltik }),
        visibleInSuggestions: true,
        icon: <IconImage />,
      },
    ],
  }
}
