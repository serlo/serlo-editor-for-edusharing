import { GetServerSideProps } from 'next'

import { migrate, emptyDocument } from '../storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'

export const getServerSideProps: GetServerSideProps<SerloEditorProps> = async (
  context
) => {
  const mayEdit = context.query.mayEdit === 'true'
  const ltik = Array.isArray(context.query.ltik)
    ? context.query.ltik[0]
    : context.query.ltik

  const response = await fetch(process.env.EDITOR_URL + 'lti/get-content', {
    headers: {
      Authorization: `Bearer ${ltik}`,
    },
  })

  const state =
    response.status === 204 ? migrate(emptyDocument) : await response.json()

  return {
    props: {
      mayEdit,
      ltik,
      state: migrate(state),
      providerUrl: process.env.EDITOR_URL,
    },
  }
}

export default SerloEditor
