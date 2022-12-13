import {
  child,
  EditorPlugin,
  EditorPluginProps,
  object,
  string,
} from '@edtr-io/plugin'
import { getPluginRegistry } from '../../plugins'

import { BoxRenderer } from './renderer'

export function createBoxState() {
  const plugins = getPluginRegistry('box', [
    'text',
    'image',
    'equations',
    'multimedia',
    'serloTable',
    'highlight',
  ])

  return object({
    type: string(''),
    title: child({
      plugin: 'text',
      config: {
        plugins: {
          code: true,
          colors: false,
          headings: false,
          katex: true,
          links: false,
          lists: false,
          math: true,
          paragraphs: false,
          richText: false,
          suggestions: false,
        },
        noLinebreaks: true,
      },
    }),
    anchorId: string(''),
    content: child({
      plugin: 'rows',
      config: {
        plugins,
      },
    }),
  })
}

export type BoxPluginState = ReturnType<typeof createBoxState>
export type BoxProps = EditorPluginProps<BoxPluginState>

export function createBoxPlugin(): EditorPlugin<BoxPluginState> {
  return {
    Component: BoxRenderer,
    config: {},
    state: createBoxState(),
  }
}
