import {
  object,
  string,
  optional,
  EditorPluginProps,
  EditorPlugin,
} from '@edtr-io/plugin'
import clsx from 'clsx'
import Modal from 'react-modal'
import Image from 'next/future/image'
import { Button } from '../components/button'
import { useEffect, useRef, useState } from 'react'
import { MessageHint } from '../pages/platform/login'

const state = object({
  embedUrl: optional(string('')),
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
  user?: string
}

type State = typeof state
type Props = EditorPluginProps<State, EdusharingConfig>

function EdusharingAsset({ state, editable, focused, config }: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>()
  const { embedUrl } = state

  useEffect(() => {
    function handleIFrameEvent({ data, source }: MessageEvent) {
      if (source !== iframeRef.current?.contentWindow) return

      if (typeof data === 'object' && typeof data.resourceLink === 'string') {
        if (state.embedUrl.defined === false) {
          state.embedUrl.create(data.resourceLink)
        } else {
          state.embedUrl.set(data.resourceLink)
        }

        setModalIsOpen(false)
      }
    }

    window.addEventListener('message', handleIFrameEvent)

    return () => window.removeEventListener('message', handleIFrameEvent)
  }, [state.embedUrl])

  return (
    <figure
      className={clsx(
        'w-full h-96 flex justify-center items-center',
        (focused || !embedUrl.defined) && 'border border-gray-400 p-1'
      )}
    >
      {renderModal()}
      {embedUrl.defined ? (
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
      {editable && (!embedUrl.defined || focused) ? (
        <Button onClick={() => setModalIsOpen(true)}>
          Datei von edu-sharing einbinden
        </Button>
      ) : null}
    </figure>
  )

  function renderEmbed() {
    if (!embedUrl.defined) return

    const url = createLtiUrl({
      targetLink: embedUrl.value,
      messageHint: {
        type: 'resource-link',
        user: getUser(),
        resourceLink: embedUrl.value,
      },
    })

    return <iframe className="pointer-events-none" src={url} />
  }

  function renderModal() {
    if (!modalIsOpen) return

    const url = createLtiUrl({
      targetLink: config.deepLinkUrl,
      messageHint: { type: 'deep-link', user: getUser() },
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
}
