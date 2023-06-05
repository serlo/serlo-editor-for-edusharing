import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
} from '@edtr-io/plugin'
import clsx from 'clsx'
import Modal from 'react-modal'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { EdusharingAssetDecoder } from '../../shared/decoders'

const state = object({
  edusharingAsset: optional(
    object({
      repositoryId: string(''),
      nodeId: string(''),
    })
  ),
})

export function createEdusharingAssetPlugin(
  config: EdusharingConfig
): EditorPlugin<State, EdusharingConfig> {
  return { Component: EdusharingAsset, state, config }
}

export interface EdusharingConfig {
  ltik: string
}

type State = typeof state
type Props = EditorPluginProps<State, EdusharingConfig>

function EdusharingAsset({ state, editable, focused, config }: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>()
  const { edusharingAsset } = state
  const [embedHtml, setEmbedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmbedHtml() {
      if (!edusharingAsset.defined) return

      const nodeId = edusharingAsset.nodeId.value
      const repositoryId = edusharingAsset.repositoryId.value

      const embedHtmlUrl = new URL(window.location.origin)
      embedHtmlUrl.pathname = '/lti/get-embed-html'
      embedHtmlUrl.searchParams.append('nodeId', nodeId)
      embedHtmlUrl.searchParams.append('repositoryId', repositoryId)

      const response = await fetch(embedHtmlUrl.href, {
        headers: { Authorization: `Bearer ${config.ltik}` },
      })
      const result = await response.json()

      setEmbedHtml(result['detailsSnippet'])
    }

    void fetchEmbedHtml()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edusharingAsset.defined])

  useEffect(() => {
    function handleIFrameEvent({ data, source }: MessageEvent) {
      if (source !== iframeRef.current?.contentWindow) return

      if (typeof data === 'object' && EdusharingAssetDecoder.is(data)) {
        const newEdusharingAsset = {
          nodeId: data.nodeId,
          repositoryId: data.repositoryId,
        }

        if (state.edusharingAsset.defined === false) {
          state.edusharingAsset.create(newEdusharingAsset)
        } else {
          // TODO: Better implementation
          state.edusharingAsset.nodeId.set(newEdusharingAsset.nodeId)
          state.edusharingAsset.repositoryId.set(
            newEdusharingAsset.repositoryId
          )
        }

        setModalIsOpen(false)
      }
    }

    window.addEventListener('message', handleIFrameEvent)

    return () => window.removeEventListener('message', handleIFrameEvent)
  }, [state.edusharingAsset])

  return (
    <figure
      className={clsx(
        'flex items-center justify-center',
        !edusharingAsset.defined && 'h-40 w-full',
        (focused || !edusharingAsset.defined) && 'border border-gray-400 p-1'
      )}
    >
      {renderModal()}
      {edusharingAsset.defined ? (
        renderEmbed()
      ) : (
        <Image
          className="block opacity-50"
          src="/edusharing.svg"
          alt="Edusharing Logo"
          width="100"
          height="100"
        />
      )}
      {editable && (!edusharingAsset.defined || focused) ? (
        <button
          className="ece-button-blue absolute right-2 bottom-2 text-sm"
          onClick={() => setModalIsOpen(true)}
        >
          Datei von edu-sharing einbinden
        </button>
      ) : null}
    </figure>
  )

  function renderEmbed() {
    if (embedHtml == null) return

    // TODO: Remove fix when not needed any more...
    const fixedEmbedHtml = embedHtml.replaceAll('width:0px;', '')

    // TODO: Sanatize embed html?!
    return (
      <div
        className="not-prose"
        dangerouslySetInnerHTML={{ __html: fixedEmbedHtml }}
      />
    )
  }

  function renderModal() {
    if (!modalIsOpen) return

    // See https://reactcommunity.org/react-modal/accessibility/
    Modal.setAppElement(document.getElementsByTagName('body')[0])

    // TODO: Create helper function
    const url = new URL(window.location.origin)

    url.pathname = '/lti/start-edusharing-deeplink-flow'
    url.searchParams.append('ltik', config.ltik)

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
          overlay: {
            zIndex: 100,
          },
        }}
      >
        <iframe src={url.href} className="h-full w-full" ref={iframeRef} />
      </Modal>
    )
  }
}
