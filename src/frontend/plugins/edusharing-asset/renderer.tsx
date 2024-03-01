import { memo, useEffect, useState } from 'react'
import * as t from 'io-ts'
import Image from 'next/image'
import IframeResizer from 'iframe-resizer-react'

type RenderMethod = 'dangerously-set-inner-html' | 'iframe'

type EmbeddedContent = {
  detailsSnippet: string
  [key: string]: any
}

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
  const [renderMethod, setRenderMethod] = useState<RenderMethod>(
    'dangerously-set-inner-html',
  )
  const [defineContainerHeight, setDefineContainerHeight] =
    useState<boolean>(false)

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
      const { html, renderMethod, defineContainerHeight } =
        embedHtmlAndRenderMethod(result)

      setEmbedHtml(html)
      setRenderMethod(renderMethod)
      setDefineContainerHeight(defineContainerHeight)
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

  function embedHtmlAndRenderMethod(content: EmbeddedContent): {
    html: string
    renderMethod: RenderMethod
    defineContainerHeight: boolean
  } {
    let { detailsSnippet } = content

    // Remove all min-width
    detailsSnippet = detailsSnippet.replaceAll(/min-width[^;]*;/g, '')

    // Hide all footers
    detailsSnippet = detailsSnippet.replaceAll(
      /edusharing_rendering_content_footer \{/g,
      'edusharing_rendering_content_footer { display: none;',
    )

    const parser = new DOMParser()
    const htmlDocument = parser.parseFromString(detailsSnippet, 'text/html')

    const image = getImageOrUndefined(htmlDocument)

    const isPixabayImage =
      hasImageMimeType(content?.mimeType || '') &&
      content?.node?.remote?.repository?.repositoryType === 'PIXABAY'
    if (isPixabayImage) {
      const imageSnippet = buildImageSnippet(image)

      // fetch the src link of the image (usually says "Zur Originalseite
      // springen"). Note that not all pixabay images contain a source link.
      const sourceLink = htmlDocument.querySelector<HTMLAnchorElement>(
        '#edusharing_rendering_content_href',
      )

      // Positions the button to the left, makes it smaller and removes bg
      // color + padding.
      const shrinkPixabaySourceButton = `
      <style>
        #edusharing_rendering_content_href {
            margin-left: 0px !important;
            text-align: left !important;
            margin-top: 5px !important;
            display: block !important;
            width: fit-content !important;
            background-color: transparent !important;
            padding: 0px !important;
            color: #007bff !important;
            font-size: 0.7rem !important;
        }
        </style>
        `

      const emptyStringOrJumpToSource = sourceLink
        ? sourceLink.outerHTML + shrinkPixabaySourceButton
        : ''

      return {
        html: imageSnippet + emptyStringOrJumpToSource,
        renderMethod: 'dangerously-set-inner-html',
        defineContainerHeight: false,
      }
    }

    const isImageSnippet =
      image && !image.classList.contains('edusharing_rendering_content_preview')
    if (isImageSnippet) {
      // Create completely new <img> element because patching the existing one is more work/error-prone
      const imageSnippet = buildImageSnippet(image)
      return {
        html: imageSnippet,
        renderMethod: 'dangerously-set-inner-html',
        defineContainerHeight: false,
      }
    }

    // .docx, .pptx
    const isFilePreview =
      image && image.classList.contains('edusharing_rendering_content_preview')
    if (isFilePreview) {
      // Make preview image visible
      detailsSnippet = detailsSnippet
        .replace('width="0"', '')
        .replace('height="0"', '')
      return {
        html: detailsSnippet,
        renderMethod: 'dangerously-set-inner-html',
        defineContainerHeight: false,
      }
    }

    // Video & audio
    const isEmbedThatNeedsToFetchContent =
      detailsSnippet.includes('get_resource')
    if (isEmbedThatNeedsToFetchContent) {
      // Converts a function within a <script> tag in the html snippet sent by edu-sharing. Fixes "token issue" when executing script.
      detailsSnippet = detailsSnippet.replace(
        'get_resource = function(authstring)',
        'function get_resource(authstring)',
      )

      // Add iframe resizer script
      const newEmbedHtml =
        detailsSnippet +
        '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.contentWindow.min.js"></script>'
      return {
        html: newEmbedHtml,
        renderMethod: 'iframe',
        defineContainerHeight: false,
      }
    }

    const iframe = htmlDocument.querySelector('iframe')

    // H5P
    const isH5P = iframe && iframe.getAttribute('src')?.includes('h5p')
    if (isH5P) {
      return {
        html:
          detailsSnippet +
          '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.contentWindow.min.js"></script>',
        renderMethod: 'iframe',
        defineContainerHeight: false,
      }
    }

    const isPdf = iframe?.id === 'docFrame'
    if (isPdf) {
      // Do not adjust height based on container size
      iframe.style.height = 'auto'
      return {
        html: htmlDocument.body.innerHTML,
        renderMethod: 'dangerously-set-inner-html',
        defineContainerHeight: true,
      }
    }

    // Learning apps
    if (detailsSnippet.includes('learningapps.org/')) {
      let iframeHtmlElement = htmlDocument.querySelector('iframe')
      if (!iframeHtmlElement) {
        return {
          html: 'Error. Please contact support. Details: Could not find iframe in learningapp embed html.',
          renderMethod: 'dangerously-set-inner-html',
          defineContainerHeight: false,
        }
      }
      const iframeHtml = iframeHtmlElement.outerHTML
        .replace('width="95%"', 'width="100%"')
        .replace('height: 80vh', '')
      return {
        html: iframeHtml,
        renderMethod: 'dangerously-set-inner-html',
        defineContainerHeight: true,
      }
    }

    // If the detailsSnipped was not handled by one of the handlers above, change nothing in html snippet
    return {
      html: detailsSnippet,
      renderMethod: 'dangerously-set-inner-html',
      defineContainerHeight: false,
    }
  }

  function renderEmbed() {
    if (embedHtml == null) return

    if (renderMethod === 'dangerously-set-inner-html') {
      // dangerouslySetInnerHTML does not execute <script> tags.
      return (
        <div
          className={`not-prose overflow-auto max-w-full`}
          // className={`not-prose overflow-auto max-w-full !w-[${
          //   contentWidth ? contentWidth : '100%'
          // }]`}
          style={{
            width: contentWidth ? contentWidth : '100%',
            aspectRatio: defineContainerHeight ? '16/9' : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      )
      // We could use dangerously-set-html-content npm package instead. This will execute <script> tags but sadly did not work in case of the video embed.
      // return <InnerHTML className={`not-prose overflow-auto max-w-full`}
      // style={{ width: contentWidth ? contentWidth : '100%' }} html={embedHtml} />
    }

    if (renderMethod === 'iframe') {
      // IframeResizer properties:
      // - `heightCalculationMethod="lowestElement"` -> Documentation says its the most accurate (however worse performance than others)
      // - `srcDoc` -> Sets the iframe content
      // - `checkOrigin={false}` -> Necessary when using srcDoc
      // - `style={{ width: '1px', minWidth: '100%' }}` -> Makes Iframe have width 100% and take as much height as it needs. Recommended by documentation.
      // - Missing `sandbox` -> Should put no restrictions on what the iframe can do: A) Make iframe send the same cookies as the host. B) Allow it to execute scripts. Both important to be able to fetch video.
      return (
        <div
          className="max-w-full"
          style={{
            width: contentWidth ? contentWidth : '100%',
            aspectRatio: defineContainerHeight ? '16/9' : undefined,
          }}
        >
          {defineContainerHeight ? (
            <iframe
              srcDoc={embedHtml}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <MemoizedIframeResizer
              heightCalculationMethod="lowestElement"
              checkOrigin={false}
              srcDoc={embedHtml}
              style={{ width: '1px', minWidth: '100%' }}
            />
          )}
        </div>
      )
    }

    return null
  }
}

function getImageOrUndefined(
  htmlDocument: Document,
): HTMLImageElement | undefined {
  const image =
    htmlDocument.querySelector<HTMLImageElement>(
      '.edusharing_rendering_content_wrapper > img',
    ) ??
    htmlDocument.querySelector<HTMLImageElement>(
      '.edusharing_rendering_content',
    )

  if (image && image.nodeName !== 'IMG') {
    return undefined
  }

  return image
}

function buildImageSnippet(image: HTMLImageElement): string {
  return `
    <img style="width: 100%; object-fit: contain;" src="${image.getAttribute(
      'src',
    )}" alt="${image.getAttribute('alt')}" title="${image.getAttribute(
      'title',
    )}" />
  `
}

const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
]

function hasImageMimeType(mimeType: string): boolean {
  return imageMimeTypes.includes(mimeType)
}

// Only re-render if `srcDoc` prop changed. We do not want to re-render the Iframe every time when EdusharingAssetRenderer is re-rendered because the state within the iframe is lost.
const MemoizedIframeResizer = memo(
  IframeResizer,
  (prevProps, nextProps) => prevProps.srcDoc === nextProps.srcDoc,
)
