import { GetServerSideProps } from 'next'

import { kitchenSink } from '../fixtures/kitchen-sink'
import { Layout } from '../layout'
import { migrate, emptyDocument } from '../storage-format'
import { createPlugins } from '../plugins'
import { getJsonBody } from '../utils/get-json-body'
import { Renderer } from '@edtr-io/renderer'
import dynamic from 'next/dynamic'
import type { EditorProps } from '../editor/editor'
import { EdusharingConfig } from '../plugins/edusharing-asset'

const Editor = dynamic<EditorProps>(() =>
  import('../editor/editor').then((mod) => mod.Editor)
)

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const providerUrl = process.env.EDITOR_URL
  const edusharingConfig: EdusharingConfig = {
    clientId: process.env.EDITOR_CLIENT_ID,
    deepLinkUrl: process.env.EDITOR_TARGET_DEEP_LINK_URL,
    deploymentId: process.env.EDITOR_DEPLOYMENT_ID,
    loginInitiationUrl: process.env.EDITOR_LOGIN_INITIATION_URL,
    providerUrl,
  }

  if (context.req.method !== 'POST') {
    return {
      props: {
        state: migrate({ ...emptyDocument, document: kitchenSink }),
        ltik: '',
        mayEdit: true,
        providerUrl,
        edusharingConfig,
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

  // TODO: We definitely need to have a more clean implementation here
  if (props.user) {
    edusharingConfig.user = props.user
  }
  if (props.dataToken) {
    edusharingConfig.dataToken = props.dataToken
  }
  if (props.ltik) {
    edusharingConfig.ltik = props.ltik
  }
  if (props.nodeId) {
    edusharingConfig.nodeId = props.nodeId
  }

  return {
    props: {
      ...props,
      state: migrate(state),
      providerUrl,
      edusharingConfig,
    },
  }
}

export interface PageProps extends EditorProps {
  mayEdit: boolean
  user?: string
  dataToken?: string
  nodeId?: string
}

export default function Page(props: PageProps) {
  if (props.mayEdit) {
    return <Editor {...props} />
  } else {
    return (
      <Layout>
        <Renderer
          plugins={createPlugins(props.edusharingConfig)}
          state={props.state.document}
        />
      </Layout>
    )
  }
}
