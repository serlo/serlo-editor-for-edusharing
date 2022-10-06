import { useEffect, useRef, useState } from 'react'

export default function Platform() {
  const url = new URL('http://localhost:3000/lti/login')
  url.searchParams.append('iss', 'http://localhost:3000')
  url.searchParams.append('target_link_uri', 'http://localhost:3000/lti')
  url.searchParams.append('login_hint', 'editor')
  url.searchParams.append('lti_message_hint', 'editor')

  const src = url.href

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
    return <pre>{JSON.stringify(resourceLink, null, 2)}</pre>
  }

  if (picking) {
    return <iframe src={src} ref={iframeRef} />
  }

  return <button onClick={() => setPicking(true)}>Pick</button>
}
