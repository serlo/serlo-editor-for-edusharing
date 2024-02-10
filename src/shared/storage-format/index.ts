import * as t from 'io-ts'

import { kitchenSink } from './kitchen-sink'

/** The creator of the saved data -> Serlo editor */
export const documentType = 'https://serlo.org/editor'
/** The variant of the Serlo editor that created this saved data */
export const variantType =
  'https://github.com/serlo/serlo-editor-for-edusharing'
const migrations: Migration[] = []
const currentVersion = migrations.length

export const emptyDocument: StorageFormat = {
  type: documentType,
  variant: variantType,
  version: 0,
  dateModified: getCurrentDatetime(),
  document: {
    plugin: 'type-generic-content',
    state: {
      content: {
        plugin: 'rows',
        state: [
          {
            plugin: 'text',
            state: [
              {
                type: 'p',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    },
  },
}

export const kitchenSinkDocument: StorageFormat = {
  type: documentType,
  variant: variantType,
  version: 0,
  dateModified: getCurrentDatetime(),
  document: kitchenSink,
}

export function migrate(state: StorageFormat): StorageFormat {
  const migrationsToApply = migrations.slice(
    state.version,
    currentVersion - state.version,
  )

  let document = state.document
  migrationsToApply.forEach((migration) => {
    document = migration(document)
  })

  return {
    type: documentType,
    variant: variantType,
    version: currentVersion,
    dateModified: getCurrentDatetime(),
    document,
  }
}

type Migration = (state: StorageFormat['document']) => StorageFormat['document']

export const StorageFormatRuntimeType = t.type({
  type: t.string,
  variant: t.string,
  version: t.number,
  dateModified: t.string,
  document: t.intersection([
    t.type({
      plugin: t.string,
    }),
    t.partial({
      state: t.unknown,
    }),
  ]),
})

export function getCurrentDatetime() {
  return new Date().toISOString()
}

export type StorageFormat = t.TypeOf<typeof StorageFormatRuntimeType>
