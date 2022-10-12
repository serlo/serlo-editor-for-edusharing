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
  const { embedUrl } = state

  // TODO: Shall we use <figure> here?
  return (
    <div className="w-full h-40 border border-gray-500 relative">
      {renderModal()}
      {embedUrl.defined ? (
        <iframe src={embedUrl.value} />
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

  function renderModal() {
    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
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
        <h1>Hello World</h1>
      </Modal>
    )
  }
}
