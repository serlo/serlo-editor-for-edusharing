import { createAnchorPlugin } from '@edtr-io/plugin-anchor'
import { createBlockquotePlugin } from '@edtr-io/plugin-blockquote'
import { createHighlightPlugin } from '@edtr-io/plugin-highlight'
import { createInputExercisePlugin } from '@edtr-io/plugin-input-exercise'
import { createRowsPlugin } from '@edtr-io/plugin-rows'
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
  faFilm,
  faImages,
  faNewspaper,
  faParagraph,
  faPhotoVideo,
  faQuoteRight,
} from '@edtr-io/ui'

const registry = [
  {
    name: 'text',
    title: 'Text',
    description: 'Compose content using rich text and math formulas.',
    icon: createIcon(faParagraph),
  },
  {
    name: 'blockquote',
    title: 'Quotation',
    description: 'Create indented text for quotations.',
    icon: createIcon(faQuoteRight),
  },
  // {
  //   name: 'geogebra',
  //   title: 'GeoGebra Applet',
  //   description: 'Embed GeoGebra Materials applets via URL or ID.',
  //   icon: createIcon(faCubes),
  // },
  {
    name: 'highlight',
    title: 'Source Code',
    description: 'Highlight the syntax of source code.',
    icon: createIcon(faCode),
  },
  {
    name: 'anchor',
    title: 'Anchor',
    description: 'Insert an anchor.',
    icon: createIcon(faAnchor),
  },
  // {
  //   name: 'equations',
  //   title: 'Terms and equations',
  //   description: 'Write term manipulations and solve multiline equations.',
  // },
  // {
  //   name: 'image',
  //   title: 'Image',
  //   description: 'Upload images.',
  //   icon: createIcon(faImages),
  // },
  // {
  //   name: 'important',
  //   title: 'Important Statement',
  //   description: 'A box to highlight important statements.',
  // },
  {
    name: 'serloInjection',
    title: 'serlo.org Content',
    description: 'Embed serlo.org content via their ID.',
    icon: createIcon(faNewspaper),
  },
  // {
  //   name: 'multimedia',
  //   title: 'Multimedia content associated with text',
  //   description:
  //     'edtr-io::Create an illustrating or explaining multimedia content associated with text.',
  //   icon: createIcon(faPhotoVideo),
  // },
  {
    name: 'spoiler',
    title: 'Spoiler',
    description: 'A collapsible box.',
    icon: createIcon(faCaretSquareDown),
  },
  // {
  //   name: 'table',
  //   title: 'Table',
  //   description: 'Create tables using Markdown.',
  // },
  // {
  //   name: 'video',
  //   title: 'Video',
  //   description: 'Embed YouTube, Vimeo, Wikimedia Commons or BR videos.',
  //   icon: createIcon(faFilm),
  // },
  {
    name: 'inputExercise',
    title: 'Input exercise',
    description: 'Create a input exercise.',
  },
  {
    name: 'scMcExercise',
    title: 'Choice exercise',
    description: 'Create a single- or multiple-exercise.',
  },
]

export const plugins = {
  anchor: createAnchorPlugin(),
  blockquote: createBlockquotePlugin({
    content: {
      plugin: 'text',
    },
  }),
  highlight: createHighlightPlugin(),
  inputExercise: createInputExercisePlugin({
    feedback: {
      plugin: 'text',
      config: {
        registry: [],
      },
    },
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
