import {
  Editor as E,
  useScopedDispatch,
  useScopedSelector,
  useScopedStore,
} from '@edtr-io/core'
import { Renderer } from '@edtr-io/renderer'
import {
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
import { ReactNode, useEffect, useRef, useState } from 'react'

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
  const dispatch = useScopedDispatch()
  const store = useScopedStore()
  const undoable = useScopedSelector(hasUndoActions())
  const redoable = useScopedSelector(hasRedoActions())
  const hasPendingChanges = useScopedSelector(hasPendingChangesSelector())
  const formDiv = useRef<HTMLDivElement>(null)

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
      {renderEditToolbar()}
      <Layout>{children}</Layout>
      {renderExtraEditorStyles()}
      <div ref={formDiv} />
    </>
  )

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
              const response = await fetch(`${providerUrl}/lti/save-content`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${ltik}`,
                },
                body: JSON.stringify({
                  version: state.version,
                  document: serializeRootDocument()(store.getState()),
                }),
              })
              if (response.status === 200) {
                dispatch(persist())
              }
            }}
          >
            <FontAwesomeIcon icon={faSave} /> Save
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
      `}</style>
    )
  }
}
