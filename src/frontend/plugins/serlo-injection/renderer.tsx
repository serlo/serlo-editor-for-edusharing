import IframeResizer from 'iframe-resizer-react'

export const SerloInjectionRenderer = (props: { src: string }) => {
  return (
    <div>
      <IframeResizer
        key={props.src}
        src={props.src}
        checkOrigin={false}
        className="border w-full"
      />
    </div>
  )
}
