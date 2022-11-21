import { createAnchorPlugin } from '@edtr-io/plugin-anchor'
import { createBlockquotePlugin } from '@edtr-io/plugin-blockquote'
import { createGeogebraPlugin } from '@edtr-io/plugin-geogebra'
import { createHighlightPlugin } from '@edtr-io/plugin-highlight'
import { createInputExercisePlugin } from '@edtr-io/plugin-input-exercise'
import { createMultimediaExplanationPlugin } from '@edtr-io/plugin-multimedia-explanation'
import { createRowsPlugin, RowsConfig } from '@edtr-io/plugin-rows'
import { createScMcExercisePlugin } from '@edtr-io/plugin-sc-mc-exercise'
import { createSerloInjectionPlugin } from '@edtr-io/plugin-serlo-injection'
import { createSpoilerPlugin } from '@edtr-io/plugin-spoiler'
import { createTextPlugin } from '@edtr-io/plugin-text'
import {
  createIcon,
  faAnchor,
  faCaretSquareDown,
  faCode,
  faCubes,
  faEquals,
  faNewspaper,
  faParagraph,
  faPhotoVideo,
  faTable,
} from '@edtr-io/ui'
import {
  faPuzzlePiece,
  faVectorSquare,
} from '@fortawesome/free-solid-svg-icons'
import { createBoxPlugin } from './plugins/box'

import {
  EdusharingConfig,
  createEdusharingAssetPlugin,
} from './plugins/edusharing-asset'
import { equationsPlugin } from './plugins/equations'
import { serloTablePlugin } from './serlo-table'

const registry = [
  {
    name: 'text',
    title: 'Text',
    description: 'Schreibe Text und Matheformeln, und formatiere sie.',
    icon: createIcon(faParagraph),
  },
  {
    name: 'box',
    title: 'Box',
    description: 'Rahmen für deine Beispiele, Zitate, Warnungen, Beweise, …',
    icon: createIcon(faVectorSquare),
  },
  {
    name: 'edusharingAsset',
    title: 'Edusharing Inhalte',
    description: 'Inhalte von edu-sharing einbinden',
    icon: createIcon(faCubes),
  },
  {
    name: 'equations',
    title: 'Terme und Gleichungen',
    description: 'Termumformungen und mehrzeilige Gleichungen',
    icon: createIcon(faEquals),
  },
  {
    name: 'geogebra',
    title: 'GeoGebra Applet',
    description: 'Inhalte von GeoGebra einbinden',
    icon: createIcon(faCubes),
  },
  {
    name: 'highlight',
    title: 'Quelltext',
    description: 'Code mit Syntax-Highlighting',
    icon: createIcon(faCode),
  },
  // {
  //   name: 'image',
  //   title: 'Bild',
  //   description: 'Bilder anzeigen (hochladen oder per URL)',
  //   icon: createIcon(faImages),
  // },
  {
    name: 'serloInjection',
    title: 'serlo.org Inhalt',
    description: 'Inhalte von serlo.org einbinden',
    icon: createIcon(faNewspaper),
  },
  {
    name: 'multimediaExplanation',
    title: 'Erklärung mit Multimedia-Inhalt',
    description: 'Multimedia-Inhalt mit zugehöriger Erklärung',
    icon: createIcon(faPhotoVideo),
  },
  {
    name: 'spoiler',
    title: 'Spoiler',
    description: 'Ausklappbare Box (z.B. für Exkurse)',
    icon: createIcon(faCaretSquareDown),
  },
  {
    name: 'serloTable',
    title: 'Tabelle',
    description: 'Schöne Tabellen erstellen.',
    icon: createIcon(faTable),
  },
  // {
  //   name: 'video',
  //   title: 'Video',
  //   description: 'Videos einbetten (YouTube, Vimeo, Wikimedia Commons oder BR)',
  //   icon: createIcon(faFilm),
  // },
  {
    name: 'inputExercise',
    title: 'Aufgabe mit Eingabefeld',
    description: 'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
    icon: createIcon(faPuzzlePiece),
  },
  {
    name: 'scMcExercise',
    title: 'Multiple-Choice-Aufgabe',
    description:
      'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
    icon: createIcon(faPuzzlePiece),
  },
  {
    name: 'anchor',
    title: 'Sprungmarke',
    description: 'Sprungmarke als Ziel für Anker-Links.',
    icon: createIcon(faAnchor),
  },
]

export function getPluginRegistry(
  type: string,
  include?: string[]
): RowsConfig['plugins'] {
  return include
    ? registry.filter((plugin) => include.includes(plugin.name))
    : registry
}

export function createPlugins(config: EdusharingConfig) {
  return {
    anchor: createAnchorPlugin(),
    blockquote: createBlockquotePlugin({
      content: {
        plugin: 'text',
      },
    }),
    box: createBoxPlugin(),
    edusharingAsset: createEdusharingAssetPlugin(config),
    equations: equationsPlugin,
    geogebra: createGeogebraPlugin(),
    highlight: createHighlightPlugin(),
    inputExercise: createInputExercisePlugin({
      feedback: {
        plugin: 'text',
        config: {
          registry: [],
        },
      },
    }),
    multimediaExplanation: createMultimediaExplanationPlugin({
      explanation: { plugin: 'rows' },
      plugins: [
        {
          name: 'geogebra',
          title: 'GeoGebra Applet',
        },
      ],
    }),
    rows: createRowsPlugin({
      content: { plugin: 'text' },
      plugins: registry,
    }),
    scMcExercise: createScMcExercisePlugin({
      content: { plugin: 'text', config: { registry: [] } },
      feedback: { plugin: 'text', config: { registry: [] } },
    }),
    serloTable: serloTablePlugin,
    serloInjection: createSerloInjectionPlugin(),
    spoiler: createSpoilerPlugin({
      content: { plugin: 'rows' },
    }),
    text: createTextPlugin({
      registry,
    }),
  }
}
