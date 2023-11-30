import IconBox from '../assets/plugin-icons/icon-box.svg'
import IconEquation from '../assets/plugin-icons/icon-equation.svg'
import IconHighlight from '../assets/plugin-icons/icon-highlight.svg'
import IconImage from '../assets/plugin-icons/icon-image.svg'
import IconInjection from '../assets/plugin-icons/icon-injection.svg'
import IconMultimedia from '../assets/plugin-icons/icon-multimedia.svg'
import IconSpoiler from '../assets/plugin-icons/icon-spoiler.svg'
import IconTable from '../assets/plugin-icons/icon-table.svg'
import IconText from '../assets/plugin-icons/icon-text.svg'
import IconFallback from '../assets/plugin-icons/icon-fallback.svg'
import {
  PluginsWithData,
createBoxPlugin,
equationsPlugin,
createHighlightPlugin,
// createInputExercisePlugin,
createRowsPlugin,
// createScMcExercisePlugin,
createSerloTablePlugin,
  createTextPlugin,
createMultimediaPlugin,
unsupportedPlugin,
createSpoilerPlugin,
// exercisePlugin,
// solutionPlugin,
EditorPluginType,

} from '@serlo/editor'

import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'

export function createPlugins({ ltik }: { ltik: string }): PluginsWithData {
  const pluginsThatCannotContainOtherPlugins = [
    EditorPluginType.Text,
    EditorPluginType.Equations,
    EditorPluginType.Highlight,
    'edusharingAsset',
  ]

  return [
    {
      type: EditorPluginType.Text,
      plugin: createTextPlugin({}),
      visibleInSuggestions: true,
      icon: <IconText />,
    },
    {
      type: EditorPluginType.Multimedia,
      plugin: createMultimediaPlugin({
        explanation: {
          plugin: EditorPluginType.Rows,
          config: {
            allowedPlugins: [EditorPluginType.Text],
          },
        },
        allowedPlugins: ['edusharingAsset'],
      }),
      visibleInSuggestions: true,
      icon: <IconMultimedia />,
    },
    {
      type: EditorPluginType.Spoiler,
      plugin: createSpoilerPlugin({
        allowedPlugins: pluginsThatCannotContainOtherPlugins,
      }),
      visibleInSuggestions: true,
      icon: <IconSpoiler />,
    },
    {
      type: EditorPluginType.Box,
      plugin: createBoxPlugin({
        allowedPlugins: pluginsThatCannotContainOtherPlugins,
      }),
      visibleInSuggestions: true,
      icon: <IconBox />,
    },
    {
      type: EditorPluginType.SerloTable,
      plugin: createSerloTablePlugin({
        allowImageInTableCells: false,
      }),
      visibleInSuggestions: true,
      icon: <IconTable />,
    },
    {
      type: 'serloInjection',
      plugin: createSerloInjectionPlugin(),
      visibleInSuggestions: true,
      icon: <IconInjection />,
    },
    {
      type: EditorPluginType.Equations,
      plugin: equationsPlugin,
      visibleInSuggestions: true,
      icon: <IconEquation />,
    },
    // Deactivated temporarily because geogebra static renderer view is broken
    // {
    //   type: EditorPluginType.Geogebra,
    //   plugin: geoGebraPlugin,
    //   visibleInSuggestions: true,
    //   icon: <IconGeogebra />,
    // },
    {
      type: EditorPluginType.Highlight,
      plugin: createHighlightPlugin(),
      visibleInSuggestions: true,
      icon: <IconHighlight />,
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
    //   type: EditorPluginType.Exercise,
    //   plugin: exercisePlugin,
    //   visibleInSuggestions: true,
    // },
    // { type: EditorPluginType.Solution, plugin: solutionPlugin },
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
    // {
    //   type: EditorPluginType.FillInTheBlanksExercise,
    //   plugin: fillInTheBlanksExercise,
    // },

    // Special plugins, never visible in suggestions
    // ===================================================
    { type: EditorPluginType.Rows, plugin: createRowsPlugin() },
    { type: EditorPluginType.Unsupported, plugin: unsupportedPlugin },
  ]
}
