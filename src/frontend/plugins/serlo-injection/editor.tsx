import { useEffect, useState } from 'react'
import { faNewspaper } from '@fortawesome/free-solid-svg-icons'

import {
  EditorInput,
  PreviewOverlay,
  FaIcon,
  PluginToolbar,
  PluginDefaultTools,
} from '@serlo/editor'

import { SerloInjectionProps } from '.'
import { useSerloInjectionConfig } from './config'
import { SerloInjectionRenderer } from './renderer'

export const SerloInjectionEditor = (props: SerloInjectionProps) => {
  const { focused, id } = props
  const config = useSerloInjectionConfig(props.config)
  const [cache, setCache] = useState(props.state.value)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCache(props.state.value)
    }, 2000)
    return () => {
      clearTimeout(timeout)
    }
  }, [props.focused, props.state.value])

  return (
    <>
      {renderPluginToolbar()}
      {cache ? (
        <PreviewOverlay
          focused={props.focused || false}
          // Todo: nextActive should be of type SetStateAction<boolean>
          onChange={(nextActive: boolean | ((x: boolean) => boolean)) => {
            setPreview(nextActive)
            if (nextActive) {
              setCache(props.state.value)
            }
          }}
        >
          <SerloInjectionRenderer contentId={cache} />
        </PreviewOverlay>
      ) : (
        <div className="edusharing-relative edusharing-w-full edusharing-text-center">
          <FaIcon
            icon={faNewspaper}
            className="edusharing-relative edusharing-w-full edusharing-text-center edusharing-text-[5rem] edusharing-text-gray-400"
          />
        </div>
      )}

      {props.focused && !preview ? (
        <div className="edusharing-mt-4">
          <EditorInput
            label={config.i18n.label}
            placeholder={config.i18n.placeholder}
            value={props.state.value}
            onChange={(e) => {
              props.state.set(e.target.value)
            }}
            width="30%"
            inputWidth="100%"
          />
        </div>
      ) : null}
    </>
  )

  function renderPluginToolbar() {
    if (!focused) return null

    return (
      <PluginToolbar
        pluginType="serlo.org Inhalt"
        pluginControls={<PluginDefaultTools pluginId={id} />}
      />
    )
  }
}
