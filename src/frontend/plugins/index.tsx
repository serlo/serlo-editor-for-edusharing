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
import { createMultimediaExplanationPlugin } from '@/serlo-editor/plugins/multimedia-explanation'
import { createRowsPlugin } from '@/serlo-editor/plugins/rows'
import { createScMcExercisePlugin } from '@/serlo-editor/plugins/sc-mc-exercise'
import { createSerloTablePlugin } from '@/serlo-editor/plugins/serlo-table'
import { createSpoilerPlugin } from '@/serlo-editor/plugins/spoiler'
import { createTextPlugin } from '@/serlo-editor/plugins/text'
import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'

// export type PluginType = 'text' | 'box'

export function createPlugins({
  ltik,
}: {
  ltik: string
}): PluginsContextPlugins {
  const pluginsThatCannotContainOtherPlugins = [
    'text',
    'edusharingAsset',
    'equations',
    'geogebra',
    'highlight',
    'inputExercise',
    'scMcExercise',
  ]

  return [
    {
      type: 'text',
      plugin: createTextPlugin({ serloLinkSearch: false }),
      visible: true,
      icon: <IconText />,
    },
    {
      type: 'box',
      plugin: createBoxPlugin({
        allowedPlugins: pluginsThatCannotContainOtherPlugins,
      }),
      visible: true,
      icon: <IconBox />,
    },
    {
      type: 'edusharingAsset',
      plugin: createEdusharingAssetPlugin({ ltik: ltik }),
      visible: true,
      icon: <IconImage />,
    },
    {
      type: 'equations',
      plugin: equationsPlugin,
      visible: true,
      icon: <IconEquation />,
    },
    {
      type: 'geogebra',
      plugin: geoGebraPlugin,
      visible: true,
      icon: <IconGeogebra />,
    },
    {
      type: 'highlight',
      plugin: createHighlightPlugin(),
      visible: true,
      icon: <IconHighlight />,
    },
    {
      type: 'serloInjection',
      plugin: createSerloInjectionPlugin(),
      visible: true,
      icon: <IconInjection />,
    },
    {
      type: 'multimedia',
      plugin: createMultimediaExplanationPlugin({
        explanation: {
          plugin: 'rows',
          config: {
            allowedPlugins: pluginsThatCannotContainOtherPlugins,
          },
        },
        plugins: ['edusharingAsset', 'geogebra'],
      }),
      visible: true,
      icon: <IconMultimedia />,
    },
    {
      type: 'spoiler',
      plugin: createSpoilerPlugin({
        content: {
          plugin: 'rows',
          config: {
            allowedPlugins: pluginsThatCannotContainOtherPlugins,
          },
        },
      }),
      visible: true,
      icon: <IconSpoiler />,
    },
    {
      type: 'serloTable',
      plugin: createSerloTablePlugin({
        allowImageInTableCells: false,
      }),
      visible: true,
      icon: <IconTable />,
    },
    {
      type: 'inputExercise',
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
      type: 'scMcExercise',
      plugin: {
        ...createScMcExercisePlugin(),
        defaultTitle: 'Multiple-Choice-Aufgabe',
        defaultDescription:
          'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
      },
      visible: true,
      icon: <IconFallback />,
    },
    {
      type: 'rows',
      plugin: createRowsPlugin(),
    },
  ]
}
