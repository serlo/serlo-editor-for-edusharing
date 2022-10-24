export const documentType = 'https://github.com/serlo/ece-as-a-service'

export const emptyDocument: StorageFormat = {
  type: documentType,
  version: 0,
  document: { plugin: 'rows' },
}

export interface StorageFormat {
  type: typeof documentType
  version: number
  document: { plugin: string; state?: unknown }
}

export type Migration = (
  state: StorageFormat['document']
) => StorageFormat['document']

const migrations: Migration[] = []

export const currentVersion = migrations.length

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
