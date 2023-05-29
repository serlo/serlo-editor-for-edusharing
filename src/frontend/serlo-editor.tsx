import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Renderer } from '@edtr-io/renderer'

import type { EditorProps } from './editor'
import { createPlugins } from './plugins'
import { Layout } from './layout'
import { InstanceDataProvider } from '@frontend/src/contexts/instance-context'
import {
  getInstanceDataByLang,
  getLoggedInData,
} from '@frontend/src/helper/feature-i18n'
import { Instance } from '@frontend/src/fetcher/graphql-types/operations'
import { LoggedInDataProvider } from '@frontend/src/contexts/logged-in-data-context'
import { LoggedInData } from '@frontend/src/data-types'

const Editor = dynamic<EditorProps>(() =>
  import('../frontend/editor').then((mod) => mod.Editor)
)

export interface SerloEditorProps extends EditorProps {
  mayEdit: boolean
}

export function SerloEditor(props: SerloEditorProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
      </Head>
      <InstanceDataProvider value={getInstanceDataByLang(Instance.De)}>
        <LoggedInDataProvider
          value={getLoggedInData(Instance.De) as LoggedInData}
        >
          <div className="serlo-editor-hacks">
            {props.mayEdit ? (
                <Editor {...props} />
            ) : (
              <Layout>
                <Renderer
                  plugins={createPlugins({ ltik: props.ltik })}
                  state={props.state.document}
                />
              </Layout>
            )}
          </div>
        </LoggedInDataProvider>
      </InstanceDataProvider>
    </>
  )
}
