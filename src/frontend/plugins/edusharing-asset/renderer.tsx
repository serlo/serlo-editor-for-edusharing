import { useEffect, useState } from 'react'
import * as t from 'io-ts'
import Image from 'next/image'

export function EdusharingAssetRenderer(props: {
  nodeId?: string
  repositoryId?: string
  ltik: string
  contentWidth: string | null
}) {
  // Use default value for widthInPercent so that old content can be load
  // where this property was not set
  const { nodeId, repositoryId, ltik, contentWidth } = props

  let [embedHtml, setEmbedHtml] = useState<string | null>(null)

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

      // HTML snipped returned by edu-sharing cannot be used as it is.
      const newEmbedHtml = embedHtmlFor(result.detailsSnippet)

      setEmbedHtml(newEmbedHtml)
    }

    void fetchEmbedHtml()
  }, [nodeId, repositoryId, ltik])

  return (
    <figure className="w-full">
      <div className="mx-side">
        {embedHtml ? (
          renderEmbed()
        ) : (
          <div className="flex justify-center">
            <Image
              className="block opacity-50"
              src="/edusharing.svg"
              alt="Edusharing Logo"
              width="100"
              height="100"
            />
          </div>
        )}
      </div>
    </figure>
  )

  function embedHtmlFor(detailsSnipped: string) {
    const parser = new DOMParser()
    let htmlDocument = parser.parseFromString(detailsSnipped, 'text/html')

    // Image
    const image = htmlDocument.querySelector<HTMLImageElement>(
      '.edusharing_rendering_content_wrapper > img',
    )
    const isImageSnippet =
      image && !image.classList.contains('edusharing_rendering_content_preview')
    if (isImageSnippet) {
      // Create completely new <img> element because patching the existing one is more work/error-prone
      const imageSnippet = `
        <img style="width: 100%; object-fit: contain;" src="${image.getAttribute(
          'src',
        )}" alt="${image.getAttribute('alt')}" title="${image.getAttribute(
          'title',
        )}" />
      `
      return imageSnippet
    }

    // .docx, .pptx
    const isFilePreview =
      image && image.classList.contains('edusharing_rendering_content_preview')
    if (isFilePreview) {
      // Make preview image visible
      image.removeAttribute('width')
      image.removeAttribute('height')
      return htmlDocument.body.innerHTML
    }

    // Video
    const video = htmlDocument.querySelector<HTMLVideoElement>(
      '.edusharing_rendering_content_video_wrapper > video',
    )
    const isVideoSnippet = video !== null
    if (isVideoSnippet) {
      // Create completely new <video> element because patching the existing one is more work/error-prone
      const videoSnippet = `
        <video style="width: 100%; object-fit: contain;" src="${video.getAttribute(
          'src',
        )}" controls controlsList="nodownload" oncontextmenu="return false;"></video>
      `
      return videoSnippet
    }

    const iframe = htmlDocument.querySelector('iframe')

    // H5P
    const isH5P = iframe && iframe.getAttribute('src')?.includes('h5p')
    if (isH5P) {
      // Remove footer because it covers up exercise
      const footer = htmlDocument.querySelector(
        '.edusharing_rendering_content_footer',
      )
      if (footer) {
        footer.remove()
      }
      return htmlDocument.body.innerHTML
    }

    const isPdf = iframe?.id === 'docFrame'
    if (isPdf) {
      // Do not adjust height based on container size
      iframe.style.height = 'auto'
      return htmlDocument.body.innerHTML
    }

    // If the detailsSnipped was not handled by one of the handlers above, change nothing in html snippet
    return detailsSnipped
  }

  function renderEmbed() {
    if (embedHtml == null) return

    // TODO: Sanatize embed html? But I observed that embedHtml for videos contains <script>
    return (
      <div
        className={`not-prose overflow-auto max-w-full`}
        style={{ width: contentWidth ? contentWidth : '100%' }}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    )
  }
}
