import IframeResizer from 'iframe-resizer-react'

import styled from 'styled-components'

const Iframe = styled(IframeResizer)({
  width: '1px',
  minWidth: '100%',
  border: '1px solid #ddd',
  borderRadius: '2px',
})

export const SerloInjectionRenderer = (props: { src: string }) => {
  return (
    <Iframe
      key={props.src}
      src={props.src}
      checkOrigin={false}
      heightCalculationMethod="lowestElement"
      sizeHeight
    />
  )
}
