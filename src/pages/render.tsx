import { Renderer } from '@edtr-io/renderer'
import { GetServerSideProps } from 'next'

import { kitchenSink } from '../fixtures/kitchen-sink'
import { Layout } from '../layout'
import { MigratableState, migrate } from '../migrations'
import { plugins } from '../plugins'
import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method !== 'POST') {
    return {
      // TODO: revert this
      props: {
        state: migrate({
          version: 0,
          document: kitchenSink,
        }),
      },
    }
  }

  const props = await getJsonBody<RenderProps>(context)
  // TODO: validate props

  return {
    props,
    state: migrate(props.state),
  }
}

export interface RenderProps {
  state: MigratableState
}

export default function Render(props: RenderProps) {
  return (
    <Layout>
      <Renderer plugins={plugins} state={props.state.document} />
    </Layout>
  )
}
