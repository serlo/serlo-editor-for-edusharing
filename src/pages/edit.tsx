import { GetServerSideProps } from 'next'

import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method !== 'POST') {
    return {
      notFound: true,
    }
  }

  const props = await getJsonBody<EditProps>(context)
  // TODO: validate props

  return {
    props,
  }
}

export interface EditProps {
  state?: unknown
  saveUrl: string
  savePayload?: unknown
}

export default function Edit(props: EditProps) {
  return <>{JSON.stringify(props)}</>
}
