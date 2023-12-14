import { useEffect, useState } from 'react'
import { faNewspaper } from '@fortawesome/free-solid-svg-icons'

import {
  EditorInput,
  PreviewOverlay,
} from '@frontend/src/serlo-editor/editor-ui'
import { FaIcon } from '@frontend/src/components/fa-icon'
import styled from 'styled-components'

import { SerloInjectionProps } from '.'
import { useSerloInjectionConfig } from './config'
import { SerloInjectionRenderer } from './renderer'
import { PluginToolbar } from '@/serlo-editor/editor-ui/plugin-toolbar'
import { PluginDefaultTools } from '@/serlo-editor/editor-ui/plugin-toolbar/plugin-tool-menu/plugin-default-tools'

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
        <div className="relative w-full text-center">
          <FaIcon
            icon={faNewspaper}
            className="relative w-full text-center text-[5rem] text-gray-400"
          />
        </div>
      )}

      {props.focused && !preview ? (
        <div className="mt-4">
          <EditorInput
            label={config.i18n.label}
            placeholder={config.i18n.placeholder}
            value={props.state.value}
            onChange={(e) => {
              props.state.set(e.target.value)
            }}
            width="30%"
            inputWidth="100%"
            tw={undefined}
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
