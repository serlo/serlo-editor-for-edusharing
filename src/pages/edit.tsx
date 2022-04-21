import {
  Editor,
  useScopedDispatch,
  useScopedSelector,
  useScopedStore,
} from '@edtr-io/core'
import classNames from 'classnames'
import { GetServerSideProps } from 'next'
import { ReactNode } from 'react'

import { Layout } from '../layout'
import { plugins } from '../plugins'
import { getJsonBody } from '../utils/get-json-body'
import { kitchenSink } from '../fixtures/kitchen-sink'
import {
  hasRedoActions,
  hasUndoActions,
  hasPendingChanges as hasPendingChangesSelector,
  undo,
  redo,
  serializeRootDocument,
  persist,
} from '@edtr-io/store'
import { faRedoAlt } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method !== 'POST') {
    return {
      // TODO: revert this
      props: {
        state: kitchenSink,
        saveUrl: '#',
        savePayload: {
          foo: 'bar',
        },
      },
    }
  }

  const props = await getJsonBody<EditProps>(context)
  // TODO: validate props

  return {
    props,
  }
}

export interface EditProps {
  state?: { plugin: string; state?: unknown }
  saveUrl: string
  savePayload?: unknown
}

export default function Edit(props: EditProps) {
  return (
    <>
      <Editor
        plugins={plugins}
        initialState={props.state ?? { plugin: 'rows' }}
      >
        {(document) => {
          return <EditInner {...props}>{document}</EditInner>
        }}
      </Editor>
    </>
  )
}

function EditInner({
  children,
  saveUrl,
  savePayload,
}: { children: ReactNode } & EditProps) {
  const dispatch = useScopedDispatch()
  const store = useScopedStore()
  const undoable = useScopedSelector(hasUndoActions())
  const redoable = useScopedSelector(hasRedoActions())
  const hasPendingChanges = useScopedSelector(hasPendingChangesSelector())

  return (
    <>
      {renderToolbar()}
      <Layout>{children}</Layout>
      {renderExtraEditorStyles()}
    </>
  )

  function renderToolbar() {
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
              await fetch(saveUrl, {
                method: 'POST',
                body: JSON.stringify({
                  state: serializeRootDocument()(store.getState()),
                  ...(savePayload !== undefined
                    ? { payload: savePayload }
                    : {}),
                }),
              })
              dispatch(persist())
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
