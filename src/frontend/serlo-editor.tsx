import Head from 'next/head'
import dynamic from 'next/dynamic'
import { default as ToastNotice } from 'react-notify-toast'

import { InstanceDataProvider } from '@frontend/src/contexts/instance-context'
import {
  getInstanceDataByLang,
  getLoggedInData,
} from '@frontend/src/helper/feature-i18n'
import { Instance } from '@frontend/src/fetcher/graphql-types/operations'
import { LoggedInDataProvider } from '@frontend/src/contexts/logged-in-data-context'
import { InstanceData, LoggedInData } from '@frontend/src/data-types'
import { editorPlugins } from '@/serlo-editor/plugin/helpers/editor-plugins'

import type { EditorProps } from './editor'
import { Layout } from './layout'
import { StorageFormat } from '../shared/storage-format'
import { editorRenderers } from '@/serlo-editor/plugin/helpers/editor-renderer'
import { createRenderers } from './plugins/create-renderers'
import { createPlugins } from './plugins/create-plugins'
import { StaticRenderer } from '@/serlo-editor/static-renderer/static-renderer'
import { LtikContext } from './context/ltikContext'

const Editor = dynamic<EditorProps>(() =>
  import('../frontend/editor').then((mod) => mod.Editor),
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
  editorPlugins.init(createPlugins({ ltik: ltik }))
  editorRenderers.init(createRenderers())

  const serloLoggedInData = getLoggedInData(Instance.De) as LoggedInData

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
      </Head>
      <LtikContext.Provider value={ltik}>
        <InstanceDataProvider
          value={getInstanceDataByLang(Instance.De) as InstanceData | null}
        >
          <LoggedInDataProvider value={serloLoggedInData}>
            <div className="serlo-editor-hacks">
              {mayEdit ? (
                <Editor state={state} providerUrl={providerUrl} ltik={ltik} />
              ) : (
                <Layout>
                  <StaticRenderer document={state.document} />
                </Layout>
              )}
            </div>
            <ToastNotice />
          </LoggedInDataProvider>
        </InstanceDataProvider>
      </LtikContext.Provider>
    </>
  )
}
