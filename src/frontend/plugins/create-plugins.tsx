import IconBox from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-box.svg'
import IconEquation from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-equation.svg'
import IconHighlight from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-highlight.svg'
import IconImage from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-image.svg'
import IconInjection from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-injection.svg'
import IconMultimedia from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-multimedia.svg'
import IconSpoiler from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-spoiler.svg'
import IconTable from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-table.svg'
import IconText from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-text.svg'
import IconGeogebra from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-geogebra.svg'
import IconFallback from '@/serlo-editor/editor-ui/assets/plugin-icons/icon-fallback.svg'
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
import { textAreaExercisePlugin } from '@/serlo-editor/plugins/text-area-exercise'
import { unsupportedPlugin } from '@/serlo-editor/plugins/unsupported'
import { PluginsWithData } from '@frontend/src/serlo-editor/plugin/helpers/editor-plugins'
import { createSpoilerPlugin } from '@/serlo-editor/plugins/spoiler'
import { exercisePlugin } from '@/serlo-editor/plugins/exercise'
import { solutionPlugin } from '@/serlo-editor/plugins/solution'
import { EditorPluginType } from '@frontend/src/serlo-editor/types/editor-plugin-type'
import { geoGebraPlugin } from '@/serlo-editor/plugins/geogebra'

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
    {
      type: EditorPluginType.Geogebra,
      plugin: geoGebraPlugin,
      visibleInSuggestions: true,
      icon: <IconGeogebra />,
    },
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
      type: EditorPluginType.TextAreaExercise,
      plugin: textAreaExercisePlugin,
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
