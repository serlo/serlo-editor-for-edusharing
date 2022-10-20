import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
} from '@edtr-io/plugin'
import React from 'react'
import Modal from 'react-modal'
import Image from 'next/future/image'

const state = object({
  embedUrl: optional(string('')),
})
type State = typeof state
type Props = EditorPluginProps<State>

export const edusharingAssetPlugin: EditorPlugin<State> = {
  Component: EdusharingAsset,
  state,
  config: {},
}

function EdusharingAsset({ state, editable, focused }: Props) {
  const [modalIsOpen, setModalIsOpen] = React.useState(false)
  const iframeRef = React.useRef<HTMLIFrameElement>()
  const { embedUrl } = state

  React.useEffect(() => {
    window.addEventListener('message', ({ data, source }) => {
      if (source !== iframeRef.current?.contentWindow) return

      if (typeof data === 'object' && typeof data.resourceLink === 'string') {
        if (state.embedUrl.defined === false) {
          state.embedUrl.create(data.resourceLink)
        } else {
          state.embedUrl.set(data.resourceLink)
        }

        setModalIsOpen(false)
      }
    })
  }, [state.embedUrl])

  // TODO: Shall we use <figure> here?
  return (
    <div className="w-full h-40 border border-gray-500 relative">
      {renderModal()}
      {embedUrl.defined ? (
        renderEmbed()
      ) : (
        <>
          {/* TODO: Use fontawesome icon instead of edusharing logo?! */}
          <Image
            className="absolute top-1/2 left-1/2 block m-0"
            style={{ transform: 'translate(-50%, -50%)' }}
            src="/edusharing.png"
            alt="Edusharing"
            width="100"
            height="100"
          />
        </>
      )}
      {editable && (!embedUrl.defined || focused) ? (
        <button
          onClick={() => setModalIsOpen(true)}
          className="block rounded-md p-2 text-white bg-sky-800 absolute right-2 bottom-2"
        >
          {/* TODO: Add component for this button */}
          Datei von edu-sharing einbinden
        </button>
      ) : null}
    </div>
  )

  function renderEmbed() {
    if (!embedUrl.defined) return

    const url = createLtiUrl({
      targetLink: embedUrl.value,
      messageHint: embedUrl.value,
    })

    return <iframe src={url} />
  }

  function renderModal() {
    if (!modalIsOpen) return

    // TODO: Config target link
    const url = createLtiUrl({
      targetLink:
        'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/lti13',
      messageHint: 'deep-link',
    })

    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            width: '80%',
            height: '80vh',
            top: '50%',
            left: '50%',
            bottom: 'auto',
            right: 'auto',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <iframe src={url} className="w-full h-full" ref={iframeRef} />
      </Modal>
    )
  }
}

function createLtiUrl({
  targetLink,
  messageHint,
}: {
  targetLink: string
  messageHint: string
}): string {
  // Config everthing
  const url = new URL(
    'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/oidc/login_initiations'
  )

  url.searchParams.append('iss', 'http://localhost:3000')
  url.searchParams.append('target_link_uri', targetLink)
  url.searchParams.append('login_hint', 'editor')
  url.searchParams.append('lti_message_hint', messageHint)
  url.searchParams.append('client_id', 'editor')
  url.searchParams.append('lti_deployment_id', '2')

  return url.href
}
