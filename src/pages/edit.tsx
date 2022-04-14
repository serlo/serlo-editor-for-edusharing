import { Editor } from '@edtr-io/core'
import { GetServerSideProps } from 'next'

import { getJsonBody } from '../utils/get-json-body'
import { plugins } from '../plugins'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method !== 'POST') {
    return {
      // TODO: revert this
      props: {},
    }
  }

  const props = await getJsonBody<EditProps>(context)
  // TODO: validate props

  return {
    props,
  }
}

export interface EditProps {
  state?: { plugin: string; state?: unknown }
  saveUrl: string
  savePayload?: unknown
}

export default function Edit(props: EditProps) {
  return (
    <Editor
      plugins={plugins}
      initialState={props.state ?? { plugin: 'text' }}
    />
  )
}
