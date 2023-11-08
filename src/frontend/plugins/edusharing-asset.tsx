import clsx from 'clsx'
import Modal from 'react-modal'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import * as t from 'io-ts'

import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
  number,
} from '@frontend/src/serlo-editor/plugin'

import { EdusharingAssetDecoder } from '../../shared/decoders'
import { PluginToolbar } from '@/serlo-editor/editor-ui/plugin-toolbar'
import { PluginDefaultTools } from '@/serlo-editor/editor-ui/plugin-toolbar/plugin-tool-menu/plugin-default-tools'

const state = object({
  edusharingAsset: optional(
    object({
      repositoryId: string(''),
      nodeId: string(''),
    })
  ),
  height: number(20),
})

export function createEdusharingAssetPlugin(
  config: EdusharingConfig
): EditorPlugin<State, EdusharingConfig> {
  return {
    Component: EdusharingAsset,
    state,
    config,
    defaultTitle: 'Edu-sharing Inhalt',
    defaultDescription: 'Inhalte von edu-sharing einbinden',
  }
}

export interface EdusharingConfig {
  ltik: string
}

type State = typeof state
type Props = EditorPluginProps<State, EdusharingConfig>

function EdusharingAsset({ state, editable, focused, config, id }: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>()
  const { edusharingAsset, height } = state
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

      if (!response.ok) {
        setEmbedHtml(
          `Request to /lit/get-embed-html failed. Status code ${response.status}.`
        )
        return
      }

      const result: object = await response.json()

      if (!t.type({ detailsSnippet: t.string }).is(result)) {
        setEmbedHtml(
          'Request to /lit/get-embed-html failed. "detailsSnipped" is missing or not of type string.'
        )
        return
      }

      setEmbedHtml(result.detailsSnippet)
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
    <>
      {renderPluginToolbar()}
      <figure
        className={clsx(
          'flex items-center',
          edusharingAsset.defined && 'justify-start',
          !edusharingAsset.defined && 'h-40 w-full justify-center',
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
            data-testid="edusharing-plugin-button"
          >
            Datei von edu-sharing einbinden
          </button>
        ) : null}
      </figure>
    </>
  )

  function renderPluginToolbar() {
    if (!focused) return null

    return (
      <PluginToolbar
        pluginType="edusharingAsset"
        pluginControls={<PluginDefaultTools pluginId={id} />}
        pluginSettings={
          <>
            <button
              onClick={() =>
                height.set((currentValue) => Math.min(currentValue + 2, 100))
              }
              className="mr-2 rounded-md border border-gray-500 px-1 text-sm transition-all hover:bg-editor-primary-200 focus-visible:bg-editor-primary-200"
              data-qa="plugin-edusharing-bigger-button"
            >
              Größer
            </button>
            <button
              onClick={() =>
                height.set((currentValue) => Math.max(currentValue - 2, 2))
              }
              className="mr-2 rounded-md border border-gray-500 px-1 text-sm transition-all hover:bg-editor-primary-200 focus-visible:bg-editor-primary-200"
              data-qa="plugin-edusharing-smaller-button"
            >
              Kleiner
            </button>
          </>
        }
      />
    )
  }

  function renderEmbed() {
    if (embedHtml == null) return

    // TODO: Remove fix when not needed any more...
    const fixedEmbedHtml = embedHtml.replaceAll('width:0px;', '')

    const parser = new DOMParser()
    let document = parser.parseFromString(fixedEmbedHtml, 'text/html')

    const imgElement = document.querySelector(
      '.edusharing_rendering_content_wrapper > img'
    )

    if (imgElement) {
      imgElement.style.height = `${height.get()}rem`
    }

    const videoElement = document.querySelector('.videoWrapperInner > video')

    if (videoElement) {
      videoElement.style.height = `${height.get()}rem`
    }

    const updatedEmbedHtml = document.body.innerHTML

    // TODO: Sanatize embed html? But I observed that embedHtml for videos contains <script>
    return (
      <div
        className="not-prose h-full overflow-auto"
        dangerouslySetInnerHTML={{ __html: updatedEmbedHtml }}
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
