import { GetServerSideProps } from 'next'
import { useEffect, useRef } from 'react'
import { MigratableState, migrate } from '../migrations'
import { emptyDocument } from '../fixtures'
import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const props = await getJsonBody<{ ltik: string }>(context)

  return {
    props: {
      ...props,
      state: migrate(emptyDocument),
      providerUrl: process.env.PROVIDER_URL,
    },
  }
}

export interface CreateProps {
  state: MigratableState
  ltik: string
  providerUrl: string
}

export default function Create({ ltik, state, providerUrl }: CreateProps) {
  const formDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const response = await fetch(`${providerUrl}/lti/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ltik}`,
        },
        body: JSON.stringify({
          version: state.version,
          document: state.document,
        }),
      })
      const html = await response.text()
      formDiv.current.innerHTML = html.trim()
      const form = document.getElementById('ltijs_submit') as HTMLFormElement
      form.submit()
    })()
  }, [ltik, providerUrl, state])

  return <div ref={formDiv} />
}
