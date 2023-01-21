import dynamic from 'next/dynamic'
import { Renderer } from '@edtr-io/renderer'

import type { EditorProps } from './editor'
import { createPlugins } from './plugins'
import { Layout } from './layout'

const Editor = dynamic<EditorProps>(() =>
  import('../frontend/editor').then((mod) => mod.Editor)
)

export interface SerloEditorProps extends EditorProps {
  mayEdit: boolean
}

export function SerloEditor(props: SerloEditorProps) {
  if (props.mayEdit) {
    return <Editor {...props} />
  } else {
    return (
      <Layout>
        <Renderer
          plugins={createPlugins({ ltik: props.ltik })}
          state={props.state.document}
        />
      </Layout>
    )
  }
}
