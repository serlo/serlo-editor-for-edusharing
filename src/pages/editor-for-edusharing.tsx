import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import {
  migrate,
  emptyDocument,
  StorageFormatRuntimeType,
} from '../shared/storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
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
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [state, setState] = useState<SerloEditorProps['state'] | null>(null)

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
        setErrorMessages((previousErrorMessages) => [
          ...previousErrorMessages,
          `Request to lti/get-content resulted in error code: ${response.status}`,
        ])
        return
      }

      // Server will send code 204 when newly created content was opened in the editor and there is no saved state on the server yet.
      const noContentReceived = response.status === 204
      if (noContentReceived) {
        setState(migrate(emptyDocument))
        return
      }

      const contentJson: unknown = await response.json()

      if (!StorageFormatRuntimeType.is(contentJson)) {
        setErrorMessages((previousErrorMessages) => {
          return [
            ...previousErrorMessages,
            'Content json received from lti/get-content was malformed.',
          ]
        })
        return
      }

      setState(migrate(contentJson))
    }
  }, [ltik, providerUrl])

  return (
    <>
      {errorMessages.length > 0
        ? errorMessages.map((message, i) => <p key={i}>{message}</p>)
        : null}
      {state !== null ? <SerloEditor state={state} {...props} /> : null}
    </>
  )
}

type PageProps = Omit<SerloEditorProps, 'state'>
