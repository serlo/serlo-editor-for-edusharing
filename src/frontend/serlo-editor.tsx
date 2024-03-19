import Head from 'next/head'
import dynamic from 'next/dynamic'
import { default as ToastNotice } from 'react-notify-toast'

import { editorPlugins, editorRenderers, SerloRenderer } from '@serlo/editor'

import type { EditorProps } from './editor'
import { Layout } from './layout'
import { StorageFormat } from '../shared/storage-format'
import { createRenderers } from './plugins/create-renderers'
import { createPlugins } from './plugins/create-plugins'
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
  editorPlugins.init(createPlugins({ ltik }))
  editorRenderers.init(createRenderers())

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
      </Head>
      <LtikContext.Provider value={ltik}>
        {mayEdit ? (
          <Editor state={state} providerUrl={providerUrl} ltik={ltik} />
        ) : (
          <Layout>
            <SerloRenderer document={state.document} />
          </Layout>
        )}
        <ToastNotice />
      </LtikContext.Provider>
    </>
  )
}
