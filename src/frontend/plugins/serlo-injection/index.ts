import {
  EditorPlugin,
  EditorPluginProps,
  string,
  StringStateType,
} from '@frontend/src/serlo-editor/plugin'

import { SerloInjectionEditor } from './editor'

export function createSerloInjectionPlugin(
  config: SerloInjectionConfig = {}
): EditorPlugin<SerloInjectionPluginState, SerloInjectionConfig> {
  return {
    Component: SerloInjectionEditor,
    config,
    state: string(),
  }
}

export interface SerloInjectionConfig {
  i18n?: Partial<SerloInjectionPluginConfig['i18n']>
}

export type SerloInjectionPluginState = StringStateType

export interface SerloInjectionPluginConfig {
  i18n: {
    label: string
    placeholder: string
  }
}

export type SerloInjectionProps = EditorPluginProps<
  SerloInjectionPluginState,
  SerloInjectionConfig
>
