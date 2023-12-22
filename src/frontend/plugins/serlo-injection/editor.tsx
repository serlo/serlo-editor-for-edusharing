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
  const [userInput, setUserInput] = useState('')
  const [showWarning, setShowWarning] = useState(false)

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
            value={userInput}
            onChange={(e) => {
              const newUserInput = e.target.value
              setUserInput(newUserInput)
              handleNewUserInput(newUserInput)
            }}
            width="30%"
            inputWidth="100%"
            tw={undefined}
          />
          {showWarning ? (
            <div className="text-red-500 p-1 my-1">Eingabe ungültig</div>
          ) : null}
        </div>
      ) : null}
    </>
  )

  function handleNewUserInput(userInput: string) {
    const serloContentId = tryGetId()
    function tryGetId() {
      for (const regex of [
        /de.serlo.org\/(?<id>\d+)/,
        /de.serlo.org\/entity\/view\/(?<id>\d+)$/,
        /de.serlo.org\/(?<subject>[^/]+\/)?(?<id>\d+)\/(?<title>[^/]*)/,
        /de.serlo.org\/entity\/repository\/compare\/\d+\/(?<id>\d+)$/,
        /de.serlo.org\/user\/profile\/(?<id>\d+)$/,
      ]) {
        const match = regex.exec(userInput)

        if (match && match.groups !== undefined) return match.groups.id
      }
      return null
    }
    if (userInput.length > 0 && !serloContentId) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
    if (serloContentId) {
      props.state.set(serloContentId)
    }
  }

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
