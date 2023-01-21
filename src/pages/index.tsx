import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'

import { kitchenSink } from '../storage-format/kitchen-sink'
import { migrate, emptyDocument } from '../storage-format'
import { createPlugins, Layout, EditorProps } from '../frontend'
import { getJsonBody } from '../utils/get-json-body'
import { Renderer } from '@edtr-io/renderer'

const Editor = dynamic<EditorProps>(() =>
  import('../frontend/editor').then((mod) => mod.Editor)
)

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const providerUrl = process.env.EDITOR_URL

  if (context.req.method !== 'POST') {
    return {
      props: {
        state: migrate({ ...emptyDocument, document: kitchenSink }),
        ltik: '',
        mayEdit: true,
        providerUrl,
      },
    }
  }

  const props = await getJsonBody<PageProps>(context)
  const response = await fetch(process.env.EDITOR_URL + 'lti/get-content', {
    headers: {
      Authorization: `Bearer ${props.ltik}`,
    },
  })

  const state =
    response.status === 204 ? migrate(emptyDocument) : await response.json()

  return {
    props: {
      ...props,
      state: migrate(state),
      providerUrl,
    },
  }
}

export interface PageProps extends EditorProps {
  mayEdit: boolean
}

export default function Page(props: PageProps) {
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
