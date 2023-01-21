import { GetServerSideProps } from 'next'

import { kitchenSink } from '../storage-format/kitchen-sink'
import { migrate, emptyDocument } from '../storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'
import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps<SerloEditorProps> = async (
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

  const props = await getJsonBody<SerloEditorProps>(context)
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

export default SerloEditor
