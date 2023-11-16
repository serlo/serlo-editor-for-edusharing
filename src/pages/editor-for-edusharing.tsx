import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'

import {
  migrate,
  emptyDocument,
  StorageFormatRuntimeType,
} from '../shared/storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const mayEdit = context.query.mayEdit === 'true'
  const ltik = Array.isArray(context.query.ltik)
    ? context.query.ltik[0]
    : context.query.ltik

  return {
    props: {
      mayEdit,
      ltik,
      providerUrl: process.env.EDITOR_URL,
    },
  }
}

export default function Page(props: PageProps) {
  const { ltik, providerUrl } = props
  const [state, setState] = useState<PageState>({ type: 'loading' })

  useEffect(() => {
    void getContent()

    async function getContent() {
      const response = await fetch(providerUrl + 'lti/get-content', {
        headers: {
          Authorization: `Bearer ${ltik}`,
        },
      })

      const requestFailed = response.status >= 400
      if (requestFailed) {
        setState({
          type: 'error',
          message: `Request to lti/get-content resulted in error code: ${response.status}`,
        })
        return
      }

      // Server will send code 204 when newly created content was opened in the editor and there is no saved state on the server yet.
      const noContentReceived = response.status === 204
      if (noContentReceived) {
        setState({ type: 'content-fetched', content: migrate(emptyDocument) })
        return
      }

      const contentJson: unknown = await response.json()

      if (!StorageFormatRuntimeType.is(contentJson)) {
        setState({
          type: 'error',
          message: `Content json received from edu-sharing was malformed. Contained: ${JSON.stringify(
            contentJson,
          )}`,
        })
        return
      }

      setState({ type: 'content-fetched', content: migrate(contentJson) })
    }
  }, [ltik, providerUrl])

  switch (state.type) {
    case 'loading':
      return null
    // TODO: Design
    case 'error':
      return <p>Fehler: {state.message}</p>
    case 'content-fetched':
      return <SerloEditor state={state.content} {...props} />
  }
}

type PageProps = Omit<SerloEditorProps, 'state'>

type PageState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'content-fetched'; content: SerloEditorProps['state'] }
