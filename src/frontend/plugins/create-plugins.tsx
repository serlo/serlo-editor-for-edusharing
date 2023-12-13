import IconImage from '../assets/plugin-icons/icon-image.svg'
import IconInjection from '../assets/plugin-icons/icon-injection.svg'
import {
  EditorPluginType,
  createBasicPlugins,
  loggedInDataDe,
} from '@serlo/editor'

import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'

export function createPlugins({ ltik }: { ltik: string }) {
  return [
    ...createBasicPlugins({
      editorStrings: loggedInDataDe.strings.editor,
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
    }),
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

    // Exercises etc.
    // ===================================================

    // {
    //   type: EditorPluginType.InputExercise,
    //   plugin: {
    //     ...createInputExercisePlugin({
    //       feedback: {
    //         plugin: EditorPluginType.Text,
    //         config: {
    //           placeholder: 'Schreibe ein Feedback für diese Antwort',
    //         },
    //       },
    //     }),
    //     defaultTitle: 'Aufgabe mit Eingabefeld',
    //     defaultDescription:
    //       'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
    //   },
    //   icon: <IconFallback />,
    // },
    // {
    //   type: EditorPluginType.ScMcExercise,
    //   plugin: {
    //     ...createScMcExercisePlugin(),
    //     defaultTitle: 'Multiple-Choice-Aufgabe',
    //     defaultDescription:
    //       'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
    //   },
    //   icon: <IconFallback />,
    // },
  ]
}
