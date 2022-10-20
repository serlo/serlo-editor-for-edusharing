import { useEffect, useRef, useState } from 'react'

export default function Platform() {
  const url = new URL(
    'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/oidc/login_initiations'
  )

  // can be GET parameter now
  /*
  const data = new URLSearchParams()
  data.append('iss', 'http://localhost:3000')
  data.append('target_link_uri', 'http://localhost:3000/platform/done')
  data.append('login_hint', 'editor')
  data.append('lti_message_hint', 'editor')
  data.append('client_id', 'editor')
  data.append('lti_deployment_id', '0')
     */
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
  const [resourceLinkData, setResourceLinkData] = useState(null)

  useEffect(() => {
    window.addEventListener('message', (message) => {
      if (message.source !== iframeRef.current?.contentWindow) return
      const { data } = message
      if (typeof data === 'object' && typeof data.resourceLink === 'string') {
        setResourceLinkData(message.data)
        setPicking(false)
      }
    })
  }, [])

  /*
  useEffect(() => {
    async function makeLogin() {
      if (!picking) return
      const response = await fetch(url.href, {
        method: 'POST',
        body: data,
        redirect: 'manual',
      })

      console.log(await response.text())
    }
    void makeLogin()
  })*/

  if (resourceLinkData) {
    const { resourceLink } = resourceLinkData
    const url = new URL(
      'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/oidc/login_initiations'
    )

    url.searchParams.append('iss', 'http://localhost:3000')
    url.searchParams.append('target_link_uri', resourceLink)
    url.searchParams.append('login_hint', 'editor')
    url.searchParams.append('lti_message_hint', resourceLink)
    url.searchParams.append('client_id', 'editor')
    url.searchParams.append('lti_deployment_id', '2')

    return (
      <>
        <h1>State</h1>
        <pre>{JSON.stringify(resourceLinkData, null, 2)}</pre>
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
