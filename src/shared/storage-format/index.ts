import { kitchenSink } from './kitchen-sink'

export const documentType = 'https://github.com/serlo/ece-as-a-service'
const variantType = 'https://github.com/serlo/serlo-editor-for-edusharing'
const migrations: Migration[] = []
const currentVersion = migrations.length

export const emptyDocument: StorageFormat = {
  type: documentType,
  variant: variantType,
  version: 0,
  document: { plugin: 'rows' },
}

export const kitchenSinkDocument: StorageFormat = {
  type: documentType,
  variant: variantType,
  version: 0,
  document: kitchenSink,
}

export function migrate(state: StorageFormat): StorageFormat {
  const migrationsToApply = migrations.slice(
    state.version,
    currentVersion - state.version
  )

  let document = state.document
  migrationsToApply.forEach((migration) => {
    document = migration(document)
  })

  return {
    type: documentType,
    variant: variantType,
    version: currentVersion,
    document,
  }
}

type Migration = (state: StorageFormat['document']) => StorageFormat['document']

export interface StorageFormat {
  type: typeof documentType
  variant: typeof variantType
  version: number
  document: { plugin: string; state?: unknown }
}
