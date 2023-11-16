import { PrettyStaticState } from "@/serlo-editor/plugin";
import { SerloInjectionPluginState } from "../serlo-injection";

export interface SerloInjectionDocument {
  plugin: 'serloInjection',
  state: PrettyStaticState<SerloInjectionPluginState>
  id?: string
}