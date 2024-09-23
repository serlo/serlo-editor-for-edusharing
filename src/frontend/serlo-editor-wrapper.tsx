import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDebounce } from 'rooks'

import {
  SerloEditor as SerloEditorPackage,
  type BaseEditor,
  defaultPlugins,
  EditorPluginType,
} from '@serlo/editor'

import { Layout } from './layout'
import { Toolbar, savedBySerloString } from './toolbar'
import { SaveVersionModal } from './save-version-modal'

export interface SerloEditorWrapperProps {
  initialState: unknown
  providerUrl: string
  ltik: string
}

export function SerloEditorWrapper(props: SerloEditorWrapperProps) {
  const { initialState, ltik } = props
  const state = useRef(initialState)

  return (
    <SerloEditorPackage
      initialState={initialState}
      plugins={[
        ...defaultPlugins.filter(
          (plugin) =>
            plugin !== EditorPluginType.Image &&
            plugin !== EditorPluginType.DropzoneImage &&
            plugin !== EditorPluginType.ImageGallery,
        ),
        EditorPluginType.EdusharingAsset,
        EditorPluginType.SerloInjection,
        EditorPluginType.TextAreaExercise,
      ]}
      _ltik={ltik}
      editorVariant="https://github.com/serlo/serlo-editor-for-edusharing"
      onChange={(payload) => {
        state.current = payload
      }}
    >
      {(editor) => {
        customizeEditorStrings(editor.i18n)
        return <EditInner editor={editor} state={state} {...props} />
      }}
    </SerloEditorPackage>
  )
}

function customizeEditorStrings(languageData: BaseEditor['i18n']) {
  languageData.loggedInData.strings.editor.plugins.text.linkOverlay.placeholder =
    'https://example.com/'
  languageData.loggedInData.strings.editor.plugins.text.linkOverlay.inputLabel =
    "Gib eine URL inklusive 'https://' ein"
}

function EditInner({
  ltik,
  state,
  providerUrl,
  editor,
}: { editor: BaseEditor } & SerloEditorWrapperProps & {
    state: MutableRefObject<unknown>
  }) {
  const { history } = editor
  const { pendingChanges, dispatchPersistHistory } = history

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
          body: JSON.stringify(state.current),
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
    [isSaving, getSaveUrl, ltik],
  )
  const debouncedSave = useDebounce(save, 5000)

  useEffect(() => {
    if (hasPendingChanges) void debouncedSave()
  }, [hasPendingChanges, debouncedSave, pendingChanges])

  useEffect(() => {
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
      request.send(JSON.stringify(state.current))

      return request.status
    }
  }, [getSaveUrl, hasPendingChanges, ltik, save])

  return (
    <>
      <SaveVersionModal
        save={save}
        open={saveVersionModalIsOpen}
        setOpen={setSaveVersionModalIsOpen}
      />
      <Toolbar
        setSaveVersionModalIsOpen={setSaveVersionModalIsOpen}
        save={save}
        isSaving={isSaving}
        editorHistory={history}
      />
      <div className="h-20"></div>
      <Layout>{editor.element}</Layout>
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
