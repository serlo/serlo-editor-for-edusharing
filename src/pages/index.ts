import { GetServerSideProps } from 'next'

import { kitchenSinkDocument } from '../shared/storage-format'
import { migrate } from '../shared/storage-format'
import { SerloEditor, SerloEditorProps } from '../frontend'

export const getServerSideProps: GetServerSideProps<
  SerloEditorProps
> = async () => {
  return {
    props: {
      state: migrate(kitchenSinkDocument),
      ltik: '',
      mayEdit: true,
      providerUrl: process.env.EDITOR_URL,
    },
  }
}

export default SerloEditor
