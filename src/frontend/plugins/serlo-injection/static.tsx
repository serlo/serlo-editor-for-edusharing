import { EditorSerloInjectionDocument } from '../types/editor-plugins'
import { SerloInjectionRenderer } from './renderer'

export function SerloInjectionStaticRenderer(
  props: EditorSerloInjectionDocument,
) {
  const contentId = props.state

  return <SerloInjectionRenderer contentId={contentId} />
}
