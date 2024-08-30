import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'

import { SerloEditorWrapper } from '../frontend/serlo-editor-wrapper'
import { SerloRenderer } from '@serlo/editor'

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
  const { ltik, providerUrl, mayEdit } = props
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
        if (mayEdit) {
          setState({ type: 'editor', content: undefined })
        } else {
          setState({ type: 'error', message: 'Missing content!' })
        }
        return
      }

      const contentJson: unknown = await response.json()

      setState({
        type: mayEdit ? 'editor' : 'static-renderer',
        content: contentJson,
      })
    }
  }, [ltik, providerUrl])

  switch (state.type) {
    case 'loading':
      return null
    // TODO: Design
    case 'error':
      return <p>Fehler: {state.message}</p>
    case 'static-renderer':
      return <SerloRenderer state={state.content} />
    case 'editor':
      return <SerloEditorWrapper initialState={state.content} {...props} />
  }
}

type PageProps = {
  mayEdit: boolean
  ltik: string
  providerUrl: string
}

type PageState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'editor'; content: unknown }
  | { type: 'static-renderer'; content: unknown }
