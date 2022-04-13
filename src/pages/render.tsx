import { GetServerSideProps } from 'next'

import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method !== 'POST') {
    return {
      notFound: true,
    }
  }

  const props = await getJsonBody<RenderProps>(context)
  // TODO: validate props

  return {
    props,
  }
}

export interface RenderProps {
  state: unknown
}

export default function Render(props: RenderProps) {
  return <>{JSON.stringify(props)}</>
}
