import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'

import { migrate, emptyDocument } from '../shared/storage-format'
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
  const [state, setState] = useState<SerloEditorProps['state'] | null>(null)

  useEffect(() => {
    void getContent()

    async function getContent() {
      const response = await fetch(providerUrl + 'lti/get-content', {
        headers: {
          Authorization: `Bearer ${ltik}`,
        },
      })

      const state =
        response.status === 204 ? emptyDocument : await response.json()

      setState(migrate(state))
    }
  }, [ltik, providerUrl])

  return state ? <SerloEditor state={state} {...props} /> : null
}

type PageProps = Omit<SerloEditorProps, 'state'>
