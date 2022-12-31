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
import { Button } from '../components/button'
import { useEffect, useRef, useState } from 'react'
import { MessageHint } from '../pages/platform/login'

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
  clientId: string
  deepLinkUrl: string
  deploymentId: string
  loginInitiationUrl: string
  providerUrl: string
  ltik?: string
  user?: string
  dataToken?: string
  nodeId?: string
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
  }, [edusharingAsset.defined])

  useEffect(() => {
    function handleIFrameEvent({ data, source }: MessageEvent) {
      if (source !== iframeRef.current?.contentWindow) return

      if (typeof data === 'object' && typeof data.nodeId === 'string') {
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
        'flex justify-center items-center',
        !edusharingAsset.defined && 'w-full h-40',
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
        <Button onClick={() => setModalIsOpen(true)}>
          Datei von edu-sharing einbinden
        </Button>
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

    const url = createLtiUrl({
      targetLink: config.deepLinkUrl,
      messageHint: {
        type: 'deep-link',
        user: getUser(),
        dataToken: getDataToken(),
        nodeId: getNodeId(),
      },
    })

    // See https://reactcommunity.org/react-modal/accessibility/
    Modal.setAppElement(document.getElementsByTagName('body')[0])

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

  function createLtiUrl({
    targetLink,
    messageHint,
  }: {
    targetLink: string
    messageHint: MessageHint
  }): string {
    // Config everthing
    const url = new URL(config.loginInitiationUrl)

    url.searchParams.append('iss', config.providerUrl)
    url.searchParams.append('target_link_uri', targetLink)
    url.searchParams.append('login_hint', config.clientId)
    url.searchParams.append(
      'lti_message_hint',
      encodeURIComponent(JSON.stringify(messageHint))
    )
    url.searchParams.append('client_id', config.clientId)
    url.searchParams.append('lti_deployment_id', config.deploymentId)

    return url.href
  }

  function getUser() {
    return config.user ?? 'anonymous'
  }

  function getDataToken() {
    return config.dataToken ?? ''
  }

  function getNodeId() {
    return config.nodeId ?? ''
  }
}
