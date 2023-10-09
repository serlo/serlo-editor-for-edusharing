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
import { createBoxPlugin } from '@/serlo-editor/plugins/box'
import { equationsPlugin } from '@/serlo-editor/plugins/equations'
import { geoGebraPlugin } from '@/serlo-editor/plugins/geogebra'
import { createHighlightPlugin } from '@/serlo-editor/plugins/highlight'
import { createInputExercisePlugin } from '@/serlo-editor/plugins/input-exercise'
import { createRowsPlugin } from '@/serlo-editor/plugins/rows'
import { createScMcExercisePlugin } from '@/serlo-editor/plugins/sc-mc-exercise'
import { createSerloTablePlugin } from '@/serlo-editor/plugins/serlo-table'
import { exercisePlugin } from '@/serlo-editor/plugins/exercise'
import { createSpoilerPlugin } from '@/serlo-editor/plugins/spoiler'
import { createTextPlugin } from '@/serlo-editor/plugins/text'
import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'
import { createMultimediaPlugin } from '@/serlo-editor/plugins/multimedia'
import { EditorPluginType } from '@/serlo-editor-integration/types/editor-plugin-type'
import { unsupportedPlugin } from '@/serlo-editor/plugins/unsupported'
import { PluginsWithData } from '@frontend/src/serlo-editor/plugin/helpers/editor-plugins'

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
      plugin: createTextPlugin({ serloLinkSearch: false }),
      visibleInSuggestions: true,
      icon: <IconText />,
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
      type: 'edusharingAsset',
      plugin: createEdusharingAssetPlugin({ ltik }),
      visibleInSuggestions: true,
      icon: <IconImage />,
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
      type: 'serloInjection',
      plugin: createSerloInjectionPlugin(),
      visibleInSuggestions: true,
      icon: <IconInjection />,
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
        allowedPlugins: ['edusharingAsset', EditorPluginType.Geogebra],
      }),
      visibleInSuggestions: true,
      icon: <IconMultimedia />,
    },
    // NOTE: Deactivated because does not work in no-edit view.
    // {
    //   type: EditorPluginType.Spoiler,
    //   plugin: createSpoilerPlugin({
    //     allowedPlugins: pluginsThatCannotContainOtherPlugins,
    //   }),
    //   visibleInSuggestions: true,
    //   icon: <IconSpoiler />,
    // },
    {
      type: EditorPluginType.SerloTable,
      plugin: createSerloTablePlugin({
        allowImageInTableCells: false,
      }),
      visibleInSuggestions: true,
      icon: <IconTable />,
    },
    {
      type: 'exercise',
      plugin: {
        ...exercisePlugin,
        defaultTitle: 'Aufgabe mit interaktiven Elementen',
        defaultDescription: '(Interaktive) Aufgabe',
      },
      visibleInSuggestions: true,
      icon: <IconFallback />,
    },
    {
      type: EditorPluginType.InputExercise,
      plugin: createInputExercisePlugin({}),
      visibleInSuggestions: false,
      icon: <IconFallback />,
    },
    {
      type: EditorPluginType.ScMcExercise,
      plugin: createScMcExercisePlugin(),
      visibleInSuggestions: false,
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
