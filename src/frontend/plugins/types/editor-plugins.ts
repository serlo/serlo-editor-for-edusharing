import { PrettyStaticState } from '@/serlo-editor/plugin'
import { SerloInjectionPluginState } from '../serlo-injection'
import { EdusharingAssetState } from '../edusharing-asset'

export interface EditorSerloInjectionDocument {
  plugin: 'serloInjection'
  state: PrettyStaticState<SerloInjectionPluginState>
  id?: string
}

export interface EditorEdusharingAssetDocument {
  plugin: 'edusharingAsset'
  state: PrettyStaticState<EdusharingAssetState>
  id?: string
}
