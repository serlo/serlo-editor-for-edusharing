import IframeResizer from 'iframe-resizer-react'

import styled from 'styled-components'

const Iframe = styled(IframeResizer)({
  width: '1px',
  minWidth: '100%',
  border: '1px solid #ddd',
  borderRadius: '2px',
})

export function SerloInjectionRenderer(props: {
  contentId: string | undefined
}) {
  const url = createURL(props.contentId)

  return (
    <Iframe
      key={url}
      src={url}
      checkOrigin={false}
      heightCalculationMethod="lowestElement"
      sizeHeight
    />
  )
}

function createURL(id: string) {
  const pureId =
    id.startsWith('/') || id.startsWith('\\') ? id.substring(1) : id
  return `https://de.serlo.org/${pureId}?contentOnly`
}
