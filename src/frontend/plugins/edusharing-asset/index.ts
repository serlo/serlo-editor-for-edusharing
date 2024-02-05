import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
  number,
} from '@serlo/editor'

import { EdusharingAssetEditor } from './editor'

const state = object({
  edusharingAsset: optional(
    object({
      repositoryId: string(''),
      nodeId: string(''),
    }),
  ),
  height: optional(number(20)), // TODO: Remove before release. Not used any more. But removing this is a breaking change.
  contentWidth: optional(string()), // Contains values like '40rem'. Possible values ['4rem', '6rem', ...]
})

export function createEdusharingAssetPlugin(
  config: EdusharingAssetConfig,
): EditorPlugin<EdusharingAssetState, EdusharingAssetConfig> {
  return {
    Component: EdusharingAssetEditor,
    state,
    config,
    defaultTitle: 'Edu-sharing Inhalt',
    defaultDescription: 'Inhalte von edu-sharing einbinden',
  }
}

export interface EdusharingAssetConfig {
  ltik: string
}

export type EdusharingAssetState = typeof state
export type EdusharingAssetProps = EditorPluginProps<
  EdusharingAssetState,
  EdusharingAssetConfig
>
