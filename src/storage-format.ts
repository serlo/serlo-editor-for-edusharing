export interface MigratableState {
  version: number
  document: { plugin: string; state?: unknown }
}

export type Migration = (
  state: MigratableState['document']
) => MigratableState['document']

const migrations: Migration[] = []

export const currentVersion = migrations.length

export function migrate(state: MigratableState): MigratableState {
  const migrationsToApply = migrations.slice(
    state.version,
    currentVersion - state.version
  )

  let document = state.document
  migrationsToApply.forEach((migration) => {
    document = migration(document)
  })

  return {
    version: currentVersion,
    document,
  }
}
