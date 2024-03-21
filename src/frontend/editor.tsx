import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'rooks'

import {
  SerloEditor as SerloEditorPackage,
  StaticRenderer,
  type EditorData,
} from '@serlo/editor'

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
  state: StorageFormat
  providerUrl: string
  ltik: string
}

export function Editor({ state, providerUrl, ltik }: EditorProps) {
  return (
    <SerloEditorPackage initialState={state.document}>
      {(editor) => {
        const { element, languageData, storeData } = editor

        customizeEditorStrings(languageData)

        return (
          <EditInner
            ltik={ltik}
            state={state}
            providerUrl={providerUrl}
            storeData={storeData}
          >
            {element}
          </EditInner>
        )
      }}
    </SerloEditorPackage>
  )
}

function customizeEditorStrings(languageData) {
  languageData.loggedInData.strings.editor.plugins.text.linkOverlay.placeholder =
    'https://example.com/'
  languageData.loggedInData.strings.editor.plugins.text.linkOverlay.inputLabel =
    "Gib eine URL inklusive 'https://' ein"
}

function EditInner({
  children,
  ltik,
  state,
  providerUrl,
  storeData,
}: { children: ReactNode; storeData: EditorData['storeData'] } & EditorProps) {
  const {
    hasUndoActions,
    hasRedoActions,
    dispatchUndo,
    dispatchRedo,
    pendingChanges,
    dispatchPersistHistory,
    selectRootDocument,
  } = storeData

  const [isEditing, setIsEditing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveVersionModalIsOpen, setSaveVersionModalIsOpen] = useState(false)

  const lastSaveWasWithComment = useRef<boolean>(true)
  const formDiv = useRef<HTMLDivElement>(null)

  const hasPendingChanges = pendingChanges !== 0

  const getSaveUrl = useCallback(
    (comment?: string) => {
      const saveUrl = new URL(`${providerUrl}lti/save-content`)

      if (comment) {
        saveUrl.searchParams.append('comment', comment)
      }

      return saveUrl.href
    },
    [providerUrl],
  )
  const getBodyForSave = useCallback(() => {
    const document = selectRootDocument()

    if (document === null) {
      throw new Error(
        'Transforming the document content into a saveable format failed!',
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
          dispatchPersistHistory()
          lastSaveWasWithComment.current = Boolean(comment)
        } else {
          window.alert(
            `Aktuelle version konnte nicht gespeichert werden. Server gab ein Response mit dem Code ${
              response.status
            } und dem Body ${await response.text()} zurück.`,
          )
        }
      } catch (error) {
        window.alert(
          `Aktuelle version konnte nicht gespeichert werden. Fehlermeldung: ${error.message}`,
        )
      } finally {
        setIsSaving(false)
      }
    },
    [isSaving, getSaveUrl, ltik, getBodyForSave],
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
        <Toolbar
          mode="render"
          setIsEditing={setIsEditing}
          hasPendingChanges={hasPendingChanges}
          dispatchUndo={dispatchUndo}
          dispatchRedo={dispatchRedo}
        />
        <Layout>
          <StaticRenderer document={state.document} />
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
        hasUndoActions={hasUndoActions}
        hasRedoActions={hasRedoActions}
        save={save}
        isSaving={isSaving}
        hasPendingChanges={hasPendingChanges}
        dispatchUndo={dispatchUndo}
        dispatchRedo={dispatchRedo}
      />
      <div className="h-20"></div>
      <Layout>{children}</Layout>
      {renderExtraEditorStyles()}
      <div ref={formDiv} />
    </>
  )

  function renderExtraEditorStyles() {
    return (
      <style jsx global>{`
        div[data-document] h3 {
          margin-top: 1.5rem;
        }
      `}</style>
    )
  }
}
