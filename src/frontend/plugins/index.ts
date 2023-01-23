import { createAnchorPlugin } from '@edtr-io/plugin-anchor'
import { createBlockquotePlugin } from '@edtr-io/plugin-blockquote'
import { createGeogebraPlugin } from '@edtr-io/plugin-geogebra'
import { createHighlightPlugin } from '@edtr-io/plugin-highlight'
import { createInputExercisePlugin } from '@edtr-io/plugin-input-exercise'
import { createMultimediaExplanationPlugin } from '@edtr-io/plugin-multimedia-explanation'
import { createRowsPlugin } from '@edtr-io/plugin-rows'
import { createScMcExercisePlugin } from '@edtr-io/plugin-sc-mc-exercise'
import { createSerloInjectionPlugin } from '@edtr-io/plugin-serlo-injection'
import { createSpoilerPlugin } from '@edtr-io/plugin-spoiler'
import { createTextPlugin } from '@edtr-io/plugin-text'
import { createBoxPlugin } from './box'

import {
  EdusharingConfig,
  createEdusharingAssetPlugin,
} from './edusharing-asset'
import { equationsPlugin } from './equations'
import { serloTablePlugin } from './serlo-table'
import { registry } from './registry'

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