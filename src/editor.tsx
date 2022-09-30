import {
  Editor as E,
  useScopedDispatch,
  useScopedSelector,
  useScopedStore,
} from '@edtr-io/core'
import { Renderer } from '@edtr-io/renderer'
import {
  getPendingChanges,
  hasPendingChanges as hasPendingChangesSelector,
  hasRedoActions,
  hasUndoActions,
  persist,
  redo,
  serializeRootDocument,
  undo,
} from '@edtr-io/store'
import { faRedoAlt } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'rooks'
import Modal from 'react-modal'

import { Layout } from './layout'
import { plugins } from './plugins'
import { MigratableState } from './migrations'

export interface EditorProps {
  state: MigratableState
  ltik: string
  providerUrl: string
}

export function Editor(props: EditorProps) {
  return (
    <E plugins={plugins} initialState={props.state.document}>
      {(document) => {
        return (
          <EditInner {...props} version={props.state.version}>
            {document}
          </EditInner>
        )
      }}
    </E>
  )
}

function EditInner({
  children,
  ltik,
  state,
  providerUrl,
}: { children: ReactNode; version: number } & EditorProps) {
  const [isEditing, setIsEditing] = useState(true)
  const [isFirstSave, setIsFirstSave] = useState(true)
  const [saveVersionModalIsOpen, setSaveVersionModalIsOpen] = useState(false)
  const dispatch = useScopedDispatch()
  const store = useScopedStore()
  const undoable = useScopedSelector(hasUndoActions())
  const redoable = useScopedSelector(hasRedoActions())
  const pendingChanges = useScopedSelector(getPendingChanges())
  const hasPendingChanges = useScopedSelector(hasPendingChangesSelector())
  const formDiv = useRef<HTMLDivElement>(null)
  const commentInput = useRef<HTMLInputElement>(null)

  const pendingSave = useRef(false)
  const save = useCallback(
    async (comment?: string) => {
      if (pendingSave.current) return
      pendingSave.current = true

      try {
        const saveUrl = new URL(`${providerUrl}/lti/save-content`)

        if (isFirstSave || comment) {
          saveUrl.searchParams.append(
            'comment',
            comment ?? 'Datei wurde durch den Serlo-Editor aktualisiert'
          )
        }

        const response = await fetch(saveUrl.href, {
          method: 'POST',
          headers: { Authorization: `Bearer ${ltik}` },
          body: JSON.stringify({
            version: state.version,
            document: serializeRootDocument()(store.getState()),
          }),
        })
        if (response.status === 200) {
          dispatch(persist())
        }
      } catch (error) {
        console.error(error)
      }

      pendingSave.current = false
      setIsFirstSave(false)
    },
    [
      dispatch,
      ltik,
      pendingSave,
      providerUrl,
      state.version,
      store,
      isFirstSave,
    ]
  )
  const debouncedSave = useDebounce(save, 5000)

  useEffect(() => {
    void debouncedSave()
  }, [debouncedSave, pendingChanges])

  useEffect(() => {
    window.onbeforeunload = hasPendingChanges ? () => '' : null
  }, [hasPendingChanges])

  if (!isEditing) {
    return (
      <>
        {renderRenderToolbar()}
        <Layout>
          <Renderer plugins={plugins} state={state.document} />
        </Layout>
      </>
    )
  }

  return (
    <>
      {renderSaveVersionModal()}
      {renderEditToolbar()}
      <Layout>{children}</Layout>
      {renderExtraEditorStyles()}
      <div ref={formDiv} />
    </>
  )

  function renderSaveVersionModal() {
    return (
      <Modal
        isOpen={saveVersionModalIsOpen}
        onRequestClose={() => setSaveVersionModalIsOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            bottom: 'auto',
            right: 'auto',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <p>Erstelle und speichere eine neue Version:</p>
        <input
          type="text"
          className="mt-3 border-gray-300 focus-visible:outline-sky-800 rounded-md p-2 block w-full border"
          ref={commentInput}
          size={50}
          placeholder="Name der neuen Version"
        />
        <div className="text-right mt-3">
          <button
            className="inline-block rounded-md p-2 mr-2 text-white bg-sky-800"
            onClick={async () => {
              await save(commentInput.current?.value)
              setIsFirstSave(true)
              setSaveVersionModalIsOpen(false)
            }}
          >
            Speichern
          </button>
          <button
            className="inline-block rounded-md p-2 border text-sky-800 border-gray-500"
            onClick={() => setSaveVersionModalIsOpen(false)}
          >
            Schließen
          </button>
        </div>
      </Modal>
    )
  }

  function renderRenderToolbar() {
    const buttonStyle =
      'px-1.5 py-1 border border-transparent rounded-xl shadow-sm text-white text-sm font-medium bg-sky-800/0 hover:bg-sky-800 hover:opacity-100 ml-1'
    const getButtonActiveClass = (active: boolean) => {
      return active ? 'opacity-90' : 'opacity-50 cursor-not-allowed'
    }

    return (
      <nav className="fixed z-10 left-0 right-0 bg-sky-700/95">
        <div className="max-w-6xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex">
          <button
            type="button"
            className={classNames(
              buttonStyle,
              'ml-12',
              getButtonActiveClass(true)
            )}
            onClick={async () => {
              setIsEditing(true)
            }}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
        </div>
      </nav>
    )
  }

  function renderEditToolbar() {
    const buttonStyle =
      'px-1.5 py-1 border border-transparent rounded-xl shadow-sm text-white text-sm font-medium bg-sky-800/0 hover:bg-sky-800 hover:opacity-100 ml-1'
    const getButtonActiveClass = (active: boolean) => {
      return active ? 'opacity-90' : 'opacity-50 cursor-not-allowed'
    }

    return (
      <nav className="fixed z-10 left-0 right-0 bg-sky-700/95">
        <div className="max-w-6xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex">
          <button
            type="button"
            className={classNames(buttonStyle, getButtonActiveClass(undoable))}
            disabled={!undoable}
            onClick={() => {
              dispatch(undo())
            }}
          >
            <FontAwesomeIcon icon={faRedoAlt} flip="horizontal" /> Undo
          </button>
          <button
            type="button"
            className={classNames(buttonStyle, getButtonActiveClass(redoable))}
            disabled={!redoable}
            onClick={() => {
              dispatch(redo())
            }}
          >
            <FontAwesomeIcon icon={faRedoAlt} /> Redo
          </button>
          <button
            type="button"
            className={classNames(
              buttonStyle,
              'ml-12',
              getButtonActiveClass(hasPendingChanges)
            )}
            disabled={!hasPendingChanges}
            onClick={async () => {
              await save()
            }}
          >
            <FontAwesomeIcon icon={faSave} /> Save
          </button>
          <button
            type="button"
            className={classNames(buttonStyle, 'ml-12')}
            onClick={() => setSaveVersionModalIsOpen(true)}
          >
            <FontAwesomeIcon icon={faSave} /> Versionskommentar
          </button>
        </div>
      </nav>
    )
  }

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
