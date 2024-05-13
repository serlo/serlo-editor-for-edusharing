import { EditorPluginType, type SerloEditorProps } from '@serlo/editor'

export const pluginsConfig: SerloEditorProps['pluginsConfig'] = {
  box: {
    allowedPlugins: [
      EditorPluginType.Text,
      EditorPluginType.Equations,
      EditorPluginType.Highlight,
      'edusharingAsset',
    ],
  },
  multimedia: {
    explanation: {
      plugin: EditorPluginType.Rows,
      config: {
        allowedPlugins: [EditorPluginType.Text],
      },
    },
    allowedPlugins: ['edusharingAsset'],
  },
  spoiler: {
    allowedPlugins: [
      EditorPluginType.Text,
      EditorPluginType.Equations,
      EditorPluginType.Highlight,
      'edusharingAsset',
    ],
  },
  table: {
    allowImageInTableCells: false,
  },
  general: {
    enableTextAreaExercise: true,
    exerciseVisibleInSuggestion: true,
  },
}
