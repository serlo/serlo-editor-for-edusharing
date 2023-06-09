import Head from 'next/head'
import dynamic from 'next/dynamic'

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
import { InstanceData, LoggedInData } from '@frontend/src/data-types'
import { Renderer } from '@frontend/src/serlo-editor-repo/renderer'
import { StorageFormat } from '../shared/storage-format'

const Editor = dynamic<EditorProps>(() =>
  import('../frontend/editor').then((mod) => mod.Editor)
)

export interface SerloEditorProps {
  state: StorageFormat
  ltik: string
  providerUrl: string
  mayEdit: boolean
}

export function SerloEditor({
  state,
  ltik,
  providerUrl,
  mayEdit,
}: SerloEditorProps) {
  const plugins = createPlugins({ ltik: ltik })
  const initialDocumentState = state.document

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
      </Head>
      <InstanceDataProvider
        value={getInstanceDataByLang(Instance.De) as InstanceData | null}
      >
        <LoggedInDataProvider
          value={getLoggedInData(Instance.De) as LoggedInData}
        >
          <div className="serlo-editor-hacks">
            {mayEdit ? (
              <Editor
                plugins={plugins}
                state={state}
                providerUrl={providerUrl}
                ltik={ltik}
              />
            ) : (
              <Layout>
                <Renderer
                  plugins={plugins}
                  documentState={initialDocumentState}
                />
              </Layout>
            )}
          </div>
        </LoggedInDataProvider>
      </InstanceDataProvider>
    </>
  )
}
