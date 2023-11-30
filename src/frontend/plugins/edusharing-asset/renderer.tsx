import { useEffect, useState } from 'react'
import * as t from 'io-ts'
import Image from 'next/image'
import clsx from 'clsx'

export function EdusharingAssetRenderer(props: {
  nodeId?: string
  repositoryId?: string
  ltik: string
  height: number
}) {
  const { nodeId, repositoryId, ltik, height } = props

  const [embedHtml, setEmbedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmbedHtml() {
      if (nodeId === undefined || repositoryId === undefined) return

      const embedHtmlUrl = new URL(window.location.origin)
      embedHtmlUrl.pathname = '/lti/get-embed-html'
      embedHtmlUrl.searchParams.append('nodeId', nodeId)
      embedHtmlUrl.searchParams.append('repositoryId', repositoryId)

      const response = await fetch(embedHtmlUrl.href, {
        headers: { Authorization: `Bearer ${ltik}` },
      })

      if (!response.ok) {
        setEmbedHtml(
          `Request to /lit/get-embed-html failed. Status code ${response.status}.`,
        )
        return
      }

      const result: object = await response.json()

      if (!t.type({ detailsSnippet: t.string }).is(result)) {
        setEmbedHtml(
          'Request to /lit/get-embed-html failed. "detailsSnipped" is missing or not of type string.',
        )
        return
      }

      setEmbedHtml(result.detailsSnippet)
    }

    void fetchEmbedHtml()
  }, [nodeId, repositoryId, ltik])

  return (
    <figure
      className={clsx(
        'flex items-center',
        embedHtml && 'justify-start',
        !embedHtml && 'h-40 w-full justify-center',
      )}
    >
      {embedHtml ? (
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
    </figure>
  )

  function renderEmbed() {
    if (embedHtml == null) return

    const parser = new DOMParser()
    let document = parser.parseFromString(embedHtml, 'text/html')

    const contentWrapperElement = document.querySelector<HTMLDivElement>(
      '.edusharing_rendering_content_wrapper',
    )

    if (contentWrapperElement) {
      // Embed html sent by edusharing includes "width: 0px"
      contentWrapperElement.style.width = ''
    }

    const imgElement = document.querySelector<HTMLImageElement>(
      '.edusharing_rendering_content_wrapper > img',
    )

    if (imgElement) {
      imgElement.style.height = `${height}rem`
      imgElement.style.objectFit = 'contain'
      // Embed html sent by edusharing includes "width: 0px" for images.
      imgElement.style.width = ''
    }

    const videoElement = document.querySelector<HTMLVideoElement>(
      '.videoWrapperInner > video',
    )

    if (videoElement) {
      videoElement.style.height = `${height}rem`
      imgElement.style.objectFit = 'contain'
      // Embed html sent by edusharing includes "width: 0px" for videos.
      imgElement.style.width = ''
    }

    const updatedEmbedHtml = document.body.innerHTML

    // TODO: Sanatize embed html? But I observed that embedHtml for videos contains <script>
    return (
      <div
        className="not-prose h-full w-full overflow-auto"
        dangerouslySetInnerHTML={{ __html: updatedEmbedHtml }}
      />
    )
  }
}
