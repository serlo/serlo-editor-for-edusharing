import { GetServerSideProps } from 'next'
import { useEffect, useRef } from 'react'
import { MigratableState, migrate } from '../migrations'
import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const props = await getJsonBody<{ ltik: string }>(context)

  return {
    props: {
      ...props,
      state: migrate({
        version: 0,
        document: { plugin: 'rows' },
      }),
    },
  }
}

export interface CreateProps {
  state: MigratableState
  ltik: string
}

export default function Create({ ltik, state }: CreateProps) {
  const formDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const response = await fetch(`${process.env.PROVIDER_URL}/lti/create`, {
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
  }, [ltik, state])

  return <div ref={formDiv} />
}
