import { GetServerSideProps } from 'next'

import { kitchenSink } from '../shared/storage-format/kitchen-sink'
import { migrate, emptyDocument } from '../shared/storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'

export const getServerSideProps: GetServerSideProps<
  SerloEditorProps
> = async () => {
  return {
    props: {
      state: migrate({ ...emptyDocument, document: kitchenSink }),
      ltik: '',
      mayEdit: true,
      providerUrl: process.env.EDITOR_URL,
    },
  }
}

export default SerloEditor
