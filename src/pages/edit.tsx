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
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center" />
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                type="button"
                className={classNames(
                  'flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50',
                  {
                    'opacity-50 cursor-not-allowed': !undoable,
                  }
                )}
                disabled={!undoable}
                onClick={() => {
                  dispatch(undo())
                }}
              >
                Undo
              </button>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto sm:ml-3">
              <button
                type="button"
                className={classNames(
                  'flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50',
                  {
                    'opacity-50 cursor-not-allowed': !redoable,
                  }
                )}
                disabled={!redoable}
                onClick={() => {
                  dispatch(redo())
                }}
              >
                Redo
              </button>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto sm:ml-3">
              <button
                type="button"
                className={classNames(
                  'flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50',
                  {
                    'opacity-50 cursor-not-allowed': !hasPendingChanges,
                  }
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
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <Layout>{children}</Layout>
    </>
  )
}
