import IconBox from '@/assets-webkit/img/editor/icon-box.svg'
import IconEquation from '@/assets-webkit/img/editor/icon-equation.svg'
import IconHighlight from '@/assets-webkit/img/editor/icon-highlight.svg'
import IconImage from '@/assets-webkit/img/editor/icon-image.svg'
import IconInjection from '@/assets-webkit/img/editor/icon-injection.svg'
import IconMultimedia from '@/assets-webkit/img/editor/icon-multimedia.svg'
import IconTable from '@/assets-webkit/img/editor/icon-table.svg'
import IconSpoiler from '@/assets-webkit/img/editor/icon-spoiler.svg'
import IconText from '@/assets-webkit/img/editor/icon-text.svg'
import IconFallback from '@/assets-webkit/img/editor/icon-fallback.svg'
import { createBoxPlugin } from '@/serlo-editor/plugins/box'
import { equationsPlugin } from '@/serlo-editor/plugins/equations'
import { createHighlightPlugin } from '@/serlo-editor/plugins/highlight'
import { createInputExercisePlugin } from '@/serlo-editor/plugins/input-exercise'
import { createRowsPlugin } from '@/serlo-editor/plugins/rows'
import { createScMcExercisePlugin } from '@/serlo-editor/plugins/sc-mc-exercise'
import { createSerloTablePlugin } from '@/serlo-editor/plugins/serlo-table'
import { createTextPlugin } from '@/serlo-editor/plugins/text'
import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'
import { createMultimediaPlugin } from '@/serlo-editor/plugins/multimedia'
import { EditorPluginType } from '@/serlo-editor-integration/types/editor-plugin-type'
import { unsupportedPlugin } from '@/serlo-editor/plugins/unsupported'
import { PluginsWithData } from '@frontend/src/serlo-editor/plugin/helpers/editor-plugins'
import { fillInTheBlanksExercise } from '@/serlo-editor/plugins/fill-in-the-blanks-exercise'
import { createSpoilerPlugin } from '@/serlo-editor/plugins/spoiler'
import { exercisePlugin } from '@/serlo-editor/plugins/exercise'
import { solutionPlugin } from '@/serlo-editor/plugins/solution'

export function createPlugins({ ltik }: { ltik: string }): PluginsWithData {
  const pluginsThatCannotContainOtherPlugins = [
    EditorPluginType.Text,
    EditorPluginType.Equations,
    EditorPluginType.Geogebra,
    EditorPluginType.Highlight,
    EditorPluginType.InputExercise,
    EditorPluginType.ScMcExercise,
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

    {
      type: EditorPluginType.Exercise,
      plugin: exercisePlugin,
      visibleInSuggestions: true,
    },
    { type: EditorPluginType.Solution, plugin: solutionPlugin },
    {
      type: EditorPluginType.InputExercise,
      plugin: {
        ...createInputExercisePlugin({
          feedback: {
            plugin: EditorPluginType.Text,
            config: {
              placeholder: 'Schreibe ein Feedback für diese Antwort',
            },
          },
        }),
        defaultTitle: 'Aufgabe mit Eingabefeld',
        defaultDescription:
          'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
      },
      icon: <IconFallback />,
    },
    {
      type: EditorPluginType.ScMcExercise,
      plugin: {
        ...createScMcExercisePlugin(),
        defaultTitle: 'Multiple-Choice-Aufgabe',
        defaultDescription:
          'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
      },
      icon: <IconFallback />,
    },
    {
      type: EditorPluginType.FillInTheBlanksExercise,
      plugin: fillInTheBlanksExercise,
    },

    // Special plugins, never visible in suggestions
    // ===================================================
    { type: EditorPluginType.Rows, plugin: createRowsPlugin() },
    { type: EditorPluginType.Unsupported, plugin: unsupportedPlugin },
  ]
}
