import { Editor, useScopedDispatch, useScopedStore } from '@edtr-io/core'
import { persist, serializeRootDocument } from '@edtr-io/store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { GetServerSideProps } from 'next'
import { useRef } from 'react'
import { currentVersion, MigratableState, migrate } from '../migrations'
import { plugins } from '../plugins'
import { getJsonBody } from '../utils/get-json-body'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const props = await getJsonBody<CreateProps>(context)
  // TODO: validate props

  return {
    props: {
      ...props,
      state: migrate(
        props.state ?? {
          version: 0,
          document: { plugin: 'rows' },
        }
      ),
    },
  }
}

export interface CreateProps {
  state?: MigratableState
  ltik: string
}

export default function Create(props: CreateProps) {
  return (
    <>
      <Editor
        plugins={plugins}
        initialState={props.state?.document ?? { plugin: 'rows' }}
      >
        {() => {
          return (
            <EditInner
              {...props}
              version={props.state?.version ?? currentVersion}
            />
          )
        }}
      </Editor>
    </>
  )
}

function EditInner({ ltik, version }: { version: number } & CreateProps) {
  const dispatch = useScopedDispatch()
  const store = useScopedStore()
  const formDiv = useRef<HTMLDivElement>(null)

  return (
    <>
      {renderToolbar()}
      {renderExtraEditorStyles()}
      <div ref={formDiv} />
    </>
  )

  function renderToolbar() {
    const buttonStyle =
      'px-1.5 py-1 border border-transparent rounded-xl shadow-sm text-white text-sm font-medium bg-sky-800/0 hover:bg-sky-800 hover:opacity-100 ml-1'

    return (
      <nav className="fixed z-10 left-0 right-0 bg-sky-700/95">
        <div className="max-w-6xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex">
          <button
            type="button"
            className={classNames(buttonStyle, 'ml-12')}
            onClick={async () => {
              const response = await fetch('/lti/save', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${ltik}`,
                },
                body: JSON.stringify({
                  version,
                  document: serializeRootDocument()(store.getState()),
                }),
              })
              const html = await response.text()
              formDiv.current.innerHTML = html.trim()
              const form = document.getElementById(
                'ltijs_submit'
              ) as HTMLFormElement
              form.submit()
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
