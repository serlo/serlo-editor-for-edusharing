export const documentType = 'https://github.com/serlo/ece-as-a-service'
const migrations: Migration[] = []
const currentVersion = migrations.length

export const emptyDocument: StorageFormat = {
  type: documentType,
  version: 0,
  document: { plugin: 'rows' },
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
    version: currentVersion,
    document,
  }
}

type Migration = (state: StorageFormat['document']) => StorageFormat['document']

export interface StorageFormat {
  type: typeof documentType
  version: number
  document: { plugin: string; state?: unknown }
}
