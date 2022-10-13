import { useEffect, useRef, useState } from 'react'

export default function Platform() {
  const url = new URL(
    'http://localhost:3001/edu-sharing/rest/lti/v13/oidc/login_initiations'
  )

  url.searchParams.append('iss', 'http://localhost:3000')
  url.searchParams.append(
    'target_link_uri',
    'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/lti13'
  )
  url.searchParams.append('login_hint', 'editor')
  url.searchParams.append('lti_message_hint', 'deep-link')
  url.searchParams.append('client_id', 'editor')
  url.searchParams.append('lti_deployment_id', '2')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [picking, setPicking] = useState(false)
  const [resourceLink, setResourceLink] = useState(null)

  useEffect(() => {
    window.addEventListener('message', (message) => {
      if (message.source !== iframeRef.current?.contentWindow) return
      const { data } = message
      if (typeof data === 'object' && data.type === 'ltiResourceLink') {
        setResourceLink(message.data)
        setPicking(false)
      }
    })
  }, [])

  if (resourceLink) {
    const url = new URL(
      'http://localhost:3001/edu-sharing/rest/lti/v13/oidc/login_initiations'
    )

    url.searchParams.append('iss', 'http://localhost:3000')
    url.searchParams.append('target_link_uri', resourceLink['url'])
    url.searchParams.append('login_hint', 'editor')
    url.searchParams.append('lti_message_hint', 'resource-link')
    url.searchParams.append('client_id', 'editor')
    url.searchParams.append('lti_deployment_id', '2')

    return (
      <>
        <h1>State</h1>
        <pre>{JSON.stringify(resourceLink, null, 2)}</pre>
        <h2>Eingebundene Ressource</h2>
        <iframe src={url.href} style={{ width: '100%', height: '50vh' }} />
      </>
    )
  }

  if (picking) {
    return (
      <iframe
        src={url.href}
        ref={iframeRef}
        style={{ width: '100%', height: '100vh' }}
      />
    )
  }

  return <button onClick={() => setPicking(true)}>Pick</button>
}
