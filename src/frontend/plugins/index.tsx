import IconBox from '@/assets-webkit/img/editor/icon-box.svg'
import IconEquation from '@/assets-webkit/img/editor/icon-equation.svg'
import IconGeogebra from '@/assets-webkit/img/editor/icon-geogebra.svg'
import IconHighlight from '@/assets-webkit/img/editor/icon-highlight.svg'
import IconImage from '@/assets-webkit/img/editor/icon-image.svg'
import IconInjection from '@/assets-webkit/img/editor/icon-injection.svg'
import IconMultimedia from '@/assets-webkit/img/editor/icon-multimedia.svg'
import IconSpoiler from '@/assets-webkit/img/editor/icon-spoiler.svg'
import IconTable from '@/assets-webkit/img/editor/icon-table.svg'
import IconText from '@/assets-webkit/img/editor/icon-text.svg'
import IconFallback from '@/assets-webkit/img/editor/icon-fallback.svg'
import { PluginsContextPlugins } from '@/serlo-editor/core/contexts/plugins-context'
import { createBoxPlugin } from '@/serlo-editor/plugins/box'
import { equationsPlugin } from '@/serlo-editor/plugins/equations'
import { geoGebraPlugin } from '@/serlo-editor/plugins/geogebra'
import { createHighlightPlugin } from '@/serlo-editor/plugins/highlight'
import { createInputExercisePlugin } from '@/serlo-editor/plugins/input-exercise'
import { createRowsPlugin } from '@/serlo-editor/plugins/rows'
import { createScMcExercisePlugin } from '@/serlo-editor/plugins/sc-mc-exercise'
import { createSerloTablePlugin } from '@/serlo-editor/plugins/serlo-table'
import { createSpoilerPlugin } from '@/serlo-editor/plugins/spoiler'
import { createTextPlugin } from '@/serlo-editor/plugins/text'
import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'
import { createMultimediaPlugin } from '@/serlo-editor/plugins/multimedia'
import { EditorPluginType } from '@/serlo-editor-integration/types/editor-plugin-type'
import { unsupportedPlugin } from '@/serlo-editor/plugins/unsupported'

export function createPlugins({
  ltik,
}: {
  ltik: string
}): PluginsContextPlugins {
  const pluginsThatCannotContainOtherPlugins = [
    EditorPluginType.Text,
    EditorPluginType.Equations,
    EditorPluginType.Geogebra,
    EditorPluginType.Highlight,
    EditorPluginType.InputExercise,
    EditorPluginType.ScMcExercise,
    'edusharing-asset',
  ]

  return [
    {
      type: EditorPluginType.Text,
      plugin: createTextPlugin({ serloLinkSearch: false }),
      visible: true,
      icon: <IconText />,
    },
    {
      type: EditorPluginType.Box,
      plugin: createBoxPlugin({
        allowedPlugins: pluginsThatCannotContainOtherPlugins,
      }),
      visible: true,
      icon: <IconBox />,
    },
    {
      type: 'edusharingAsset', // TODO This could be EditorPluginType.EdusharingAsset in the future, but we need to figure out how to extend the type.
      plugin: createEdusharingAssetPlugin({ ltik }),
      visible: true,
      icon: <IconImage />,
    },
    {
      type: EditorPluginType.Equations,
      plugin: equationsPlugin,
      visible: true,
      icon: <IconEquation />,
    },
    {
      type: EditorPluginType.Geogebra,
      plugin: geoGebraPlugin,
      visible: true,
      icon: <IconGeogebra />,
    },
    {
      type: EditorPluginType.Highlight,
      plugin: createHighlightPlugin(),
      visible: true,
      icon: <IconHighlight />,
    },
    {
      type: 'serloInjection', // TODO This could be EditorPluginType.SerloInjection in the future, but we need to figure out how to extend the type.
      plugin: createSerloInjectionPlugin(),
      visible: true,
      icon: <IconInjection />,
    },
    {
      type: EditorPluginType.Multimedia,
      plugin: createMultimediaPlugin({
        explanation: {
          plugin: EditorPluginType.Rows,
          config: {
            allowedPlugins: pluginsThatCannotContainOtherPlugins,
          },
        },
        allowedPlugins: ['edusharingAsset', EditorPluginType.Geogebra],
      }),
      visible: true,
      icon: <IconMultimedia />,
    },
    {
      type: EditorPluginType.Spoiler,
      plugin: createSpoilerPlugin({
        allowedPlugins: pluginsThatCannotContainOtherPlugins,
      }),
      visible: true,
      icon: <IconSpoiler />,
    },
    {
      type: EditorPluginType.SerloTable,
      plugin: createSerloTablePlugin({
        allowImageInTableCells: false,
      }),
      visible: true,
      icon: <IconTable />,
    },
    {
      type: EditorPluginType.InputExercise,
      plugin: {
        ...createInputExercisePlugin({}),
        defaultTitle: 'Aufgabe mit Eingabefeld',
        defaultDescription:
          'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
      },
      visible: true,
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
      visible: true,
      icon: <IconFallback />,
    },

    // Cannot be created by user directly
    {
      type: EditorPluginType.Rows,
      plugin: createRowsPlugin(),
    },
    {
      type: EditorPluginType.Unsupported,
      plugin: unsupportedPlugin,
    },
  ]
}
