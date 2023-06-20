import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'rooks'

import { Editor as Edtr } from '@frontend/src/serlo-editor/core'
import {
  selectHasPendingChanges,
  useAppDispatch,
  useAppSelector,
  store,
  selectPendingChanges,
  selectHasUndoActions,
  selectHasRedoActions,
  selectSerializedRootDocument,
  persistHistory,
  selectDocuments,
} from '@frontend/src/serlo-editor/store'
import { Renderer } from '@frontend/src/serlo-editor/renderer'
import { EditorPlugin } from '@frontend/src/serlo-editor/internal__plugin'

import { Layout } from './layout'
import {
  StorageFormat,
  documentType,
  getCurrentDatetime,
  variantType,
} from '../shared/storage-format'
import { Toolbar, savedBySerloString } from './toolbar'
import { SaveVersionModal } from './save-version-modal'

export interface EditorProps {
  plugins: Record<string, EditorPlugin>
  state: StorageFormat
  providerUrl: string
  ltik: string
}

export function Editor({ plugins, state, providerUrl, ltik }: EditorProps) {
  return (
    <Edtr plugins={plugins} initialState={state.document}>
      {(document) => {
        return (
          <EditInner
            plugins={plugins}
            ltik={ltik}
            state={state}
            providerUrl={providerUrl}
          >
            {document}
          </EditInner>
        )
      }}
    </Edtr>
  )
}

function EditInner({
  children,
  plugins,
  ltik,
  state,
  providerUrl,
}: { children: ReactNode } & EditorProps) {
  const [isEditing, setIsEditing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveVersionModalIsOpen, setSaveVersionModalIsOpen] = useState(false)

  const dispatch = useAppDispatch()
  const undoable = useAppSelector(selectHasUndoActions)
  const redoable = useAppSelector(selectHasRedoActions)
  const pendingChanges = useAppSelector(selectPendingChanges)
  const hasPendingChanges = useAppSelector(selectHasPendingChanges)
  const lastSaveWasWithComment = useRef<boolean>(true)
  const formDiv = useRef<HTMLDivElement>(null)

  const getSaveUrl = useCallback(
    (comment?: string) => {
      const saveUrl = new URL(`${providerUrl}lti/save-content`)

      if (comment) {
        saveUrl.searchParams.append('comment', comment)
      }

      return saveUrl.href
    },
    [providerUrl]
  )
  const getBodyForSave = useCallback(() => {
    const document = selectSerializedRootDocument(store.getState())

    if (document === null) {
      throw new Error(
        'Transforming the document content into a saveable format failed!'
      )
    }

    const body: StorageFormat = {
      type: documentType,
      variant: variantType,
      version: state.version,
      dateModified: getCurrentDatetime(),
      document,
    }

    return JSON.stringify(body)
  }, [state.version])
  const save = useCallback(
    async (comment?: string) => {
      if (isSaving) return
      setIsSaving(true)

      try {
        const response = await fetch(getSaveUrl(comment), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ltik}`,
            'content-type': 'application/json',
          },
          keepalive: true,
          body: getBodyForSave(),
        })
        if (response.status === 200) {
          const documents = selectDocuments(store.getState())
          dispatch(persistHistory(documents))

          lastSaveWasWithComment.current = Boolean(comment)
        } else {
          window.alert(
            `Aktuelle version konnte nicht gespeichert werden. Server gab ein Response mit dem Code ${
              response.status
            } und dem Body ${await response.text()} zurück.`
          )
        }
      } catch (error) {
        window.alert(
          `Aktuelle version konnte nicht gespeichert werden. Fehlermeldung: ${error.message}`
        )
      } finally {
        setIsSaving(false)
      }
    },
    [isSaving, getSaveUrl, ltik, getBodyForSave, dispatch]
  )
  const debouncedSave = useDebounce(save, 5000)

  useEffect(() => {
    if (hasPendingChanges) void debouncedSave()
  }, [hasPendingChanges, debouncedSave, pendingChanges])

  useEffect(() => {
    if (!isEditing) return

    window.addEventListener('beforeunload', handleOnBeforeUnload)

    return () =>
      window.removeEventListener('beforeunload', handleOnBeforeUnload)

    // TODO: Find a better implementation for saving the document when the tab
    // is closed since the used method is deprecated (see comment of
    // `saveSync()`)
    function handleOnBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasPendingChanges && lastSaveWasWithComment.current) return

      try {
        const responseStatus = saveSync()

        if (responseStatus === 200) return
      } catch (error) {
        console.log('Error while saving document', error)
      }

      // There was either an error thrown when retrieving the document or
      // the document couldn't be saved (non 200 response) -> Show prompt
      // that there are unsaved changes
      event.preventDefault()

      return (event.returnValue = 'Fehler beim speichern des Dokuments')
    }

    // This is a synchronous reimplementation of the above save() method. Due
    // to the synchronous nature we can wait in handleOnBeforeUnload() until
    // the save requests completes.
    //
    // Note: Never use this function somewhere else since it would freeze the
    // UI for the time the HTTP request is resolved. The `async` parameter
    // is therefore also deprecated in Firefox.
    //
    // Thanks to the old XMLHttpRequest API a request is synchronous when the
    // `async` argument of `open()` is false -> see
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
    function saveSync() {
      const request = new XMLHttpRequest()

      request.open('POST', getSaveUrl(savedBySerloString), false)
      request.setRequestHeader('Authorization', `Bearer ${ltik}`)
      request.setRequestHeader('content-type', 'application/json')
      request.send(getBodyForSave())

      return request.status
    }
  }, [getBodyForSave, getSaveUrl, hasPendingChanges, isEditing, ltik, save])

  if (!isEditing) {
    return (
      <>
        <Toolbar mode="render" setIsEditing={setIsEditing} />
        <Layout>
          <Renderer plugins={plugins} documentState={state.document} />
        </Layout>
      </>
    )
  }

  return (
    <>
      <SaveVersionModal
        save={save}
        open={saveVersionModalIsOpen}
        setOpen={setSaveVersionModalIsOpen}
      />
      <Toolbar
        mode="edit"
        setIsEditing={setIsEditing}
        setSaveVersionModalIsOpen={setSaveVersionModalIsOpen}
        undoable={undoable}
        redoable={redoable}
        save={save}
        isSaving={isSaving}
      />
      <Layout>{children}</Layout>
      {renderExtraEditorStyles()}
      <div ref={formDiv} />
    </>
  )

  function renderExtraEditorStyles() {
    return (
      <style jsx global>{`
        .fa-4x {
          color: rgb(175, 215, 234);
          width: 3rem;
        }

        div[data-document] h3 {
          margin-top: 1.5rem;
        }

        /* fixes bug in chromium based browsers v105+ */
        /* https://github.com/ianstormtaylor/slate/issues/5110#issuecomment-1234951122 */
        div[data-slate-editor] {
          -webkit-user-modify: read-write !important;
        }
      `}</style>
    )
  }
}
