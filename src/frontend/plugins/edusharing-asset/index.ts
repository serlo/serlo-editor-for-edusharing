import clsx from 'clsx'
import Modal from 'react-modal'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import * as t from 'io-ts'

import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
  number,
} from '@frontend/src/serlo-editor/plugin'

import { EdusharingAssetDecoder } from '../../../shared/decoders'
import { PluginToolbar } from '@/serlo-editor/editor-ui/plugin-toolbar'
import { PluginDefaultTools } from '@/serlo-editor/editor-ui/plugin-toolbar/plugin-tool-menu/plugin-default-tools'
import { EdusharingAssetEditor } from './editor'

const state = object({
  edusharingAsset: optional(
    object({
      repositoryId: string(''),
      nodeId: string(''),
    })
  ),
  height: number(20),
})

export function createEdusharingAssetPlugin(
  config: EdusharingAssetConfig
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
export type EdusharingAssetProps = EditorPluginProps<EdusharingAssetState, EdusharingAssetConfig>