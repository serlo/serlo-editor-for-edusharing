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
  faCaretSquareDown,
  faCode,
  faCubes,
  faNewspaper,
  faParagraph,
  faPhotoVideo,
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

const registry = [
  {
    name: 'text',
    title: 'Text',
    description: 'Rich text with Headers, formatting, math formulas, …',
    icon: createIcon(faParagraph),
  },
  {
    name: 'box',
    title: 'Container',
    description: 'Container for examples, quotes, warnings, theorems, notes, …',
    icon: createIcon(faVectorSquare),
  },
  {
    name: 'edusharingAsset',
    title: 'Edusharing Media Embed',
    description: 'Embed a media element from edu-sharing',
    icon: createIcon(faCubes),
  },
  {
    name: 'geogebra',
    title: 'GeoGebra Applet',
    description: 'Embed interactive GeoGebra materials',
    icon: createIcon(faCubes),
  },
  {
    name: 'highlight',
    title: 'Source Code',
    description: 'Source code with syntax highlighting',
    icon: createIcon(faCode),
  },
  // {
  //   name: 'equations',
  //   title: 'Terms and equations',
  //   description: 'Term manipulations, commented multiline equations.',
  // icon: createIcon(faEquals),
  // },
  // {
  //   name: 'image',
  //   title: 'Image',
  //   description: 'Images with captions',
  //   icon: createIcon(faImages),
  // },
  {
    name: 'serloInjection',
    title: 'serlo.org Content',
    description: 'Embedded content from serlo.org',
    icon: createIcon(faNewspaper),
  },
  {
    name: 'multimediaExplanation',
    title: 'Multimedia content with text',
    description:
      'Illustrating or explaining multimedia content with associated text.',
    icon: createIcon(faPhotoVideo),
  },
  {
    name: 'spoiler',
    title: 'Spoiler',
    description: 'Container that hides content until opened by the user',
    icon: createIcon(faCaretSquareDown),
  },
  // {
  //   name: 'serloTable',
  //   title: editorStrings.edtrIo.serloTable,
  //   description: editorStrings.edtrIo.serloTableDesc,
  //   icon: createIcon(faTable),
  // },
  // {
  //   name: 'video',
  //   title: editorStrings.edtrIo.video,
  //   description: editorStrings.edtrIo.videoDesc,
  //   icon: createIcon(faFilm),
  // },
  {
    name: 'inputExercise',
    title: 'Input exercise',
    description: 'Interactive exercise (text or numbers as answers)',
    icon: createIcon(faPuzzlePiece),
  },
  {
    name: 'scMcExercise',
    title: 'Choice exercise',
    description:
      'Interactive multiple-choise exercise (one or more correct answers)',
    icon: createIcon(faPuzzlePiece),
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
    serloInjection: createSerloInjectionPlugin(),
    spoiler: createSpoilerPlugin({
      content: { plugin: 'rows' },
    }),
    text: createTextPlugin({
      registry,
    }),
  }
}
