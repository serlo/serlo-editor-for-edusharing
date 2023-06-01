import { useScopedStore } from '@edtr-io/core'
import { isEmptyRows } from '@edtr-io/plugin-rows'
import clsx from 'clsx'
import { useState } from 'react'

import { BoxProps } from '.'
import { FaIcon } from '../common-components'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faHandPointRight } from '@fortawesome/free-solid-svg-icons/faHandPointRight'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons/faLightbulb'
import { faMapSigns } from '@fortawesome/free-solid-svg-icons/faMapSigns'
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons/faQuoteRight'
import { faScroll } from '@fortawesome/free-solid-svg-icons/faScroll'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const boxStrings = {
  type: 'Art der Box',
  titlePlaceholder: '(optionaler Titel)',
  anchorId: 'Sprungmarke (anchor id)',
  emptyContentWarning: 'Boxen ohne Inhalt werden nicht angezeigt',
}

const boxTypeStyle: Record<
  string,
  { icon?: IconDefinition; borderColorClass?: string; colorClass?: string }
> = {
  blank: {},
  example: {},
  quote: { icon: faQuoteRight },
  approach: { icon: faMapSigns },
  remember: { icon: faScroll },
  attention: {
    icon: faExclamationTriangle,
    borderColorClass: 'border-red-100',
    colorClass: 'text-orange',
  },
  note: { icon: faHandPointRight },
  definition: { icon: faThumbtack },
  theorem: { icon: faLightbulb },
  proof: {},
}

const defaultStyle = {
  icon: undefined,
  borderColorClass: 'border-sky-300',
  colorClass: 'text-sky-600',
}

const types = Object.keys(boxTypeStyle)
export type BoxType = keyof typeof boxTypeStyle

export function BoxRenderer(props: BoxProps) {
  const { title, type, content, anchorId } = props.state
  const hasNoType = type.value === ''
  const typedValue = (hasNoType ? 'blank' : type.value) as BoxType
  const isBlank = typedValue === 'blank'

  const style = boxTypeStyle[typedValue]
  const borderColorClass = Object.hasOwn(style, 'borderColorClass')
    ? style.borderColorClass
    : defaultStyle.borderColorClass
  const colorClass = Object.hasOwn(style, 'colorClass')
    ? style.colorClass
    : defaultStyle.colorClass
  const icon = Object.hasOwn(style, 'icon') ? style.icon : undefined
  const store = useScopedStore()
  const [contentIsEmpty, setContentIsEmpty] = useState(true)

  const checkContentEmpty = () => {
    const isEmptyNow = isEmptyRows(content.get())(store.getState()) ?? true
    if (isEmptyNow !== contentIsEmpty) setContentIsEmpty(isEmptyNow)
  }

  const boxTypes = {
    blank: 'Blanko',
    example: 'Beispiel',
    quote: 'Zitat',
    approach: 'Vorgehen',
    remember: 'Merke',
    attention: 'Vorsicht',
    note: 'Beachte',
    definition: 'Definition',
    theorem: 'Satz',
    proof: 'Beweis',
  }

  return (
    <>
      <figure
        id={anchorId.value}
        className={clsx(
          'border-4 p-4 pt-2 rounded-xl relative',
          borderColorClass
        )}
      >
        {hasNoType ? (
          renderInlineSettings()
        ) : (
          <>
            {renderHeader()}
            {renderContent()}
          </>
        )}
      </figure>
      {renderSettings()}
    </>
  )

  function renderHeader() {
    return (
      <figcaption className="pt-1 flex">
        {isBlank ? null : (
          <div>
            <span className={colorClass + ' mr-1 prose-lg'}>
              {icon ? <FaIcon className="mr-1" icon={icon} /> : null}
              {boxTypes[typedValue]}
            </span>
          </div>
        )}
        <div className="block -ml-1 max-h-6 min-w-[15rem] font-bold prose-lg">
          {title.render({
            config: { placeholder: boxStrings.titlePlaceholder },
          })}
        </div>
      </figcaption>
    )
  }

  function renderContent() {
    return (
      <div className="-ml-3" onKeyUp={checkContentEmpty}>
        {content.render()}
      </div>
    )
  }

  function renderInlineSettings() {
    return (
      <>
        <b className="block pb-4">{boxStrings.type}</b>
        <ul className="pb-8 unstyled-list">{renderSettingsLis()}</ul>
      </>
    )
  }

  function renderSettings() {
    return props.renderIntoSettings(
      <>
        <b className="mx-side text-base-plus block mt-6 ml-0 mb-4">
          {boxStrings.type}
        </b>
        <ul className="pb-8">{renderSettingsLis()}</ul>

        {anchorId.value === '' ? null : (
          <p className="mb-4">
            <b>{boxStrings.anchorId}: </b>#{anchorId.value}
          </p>
        )}
      </>
    )
  }

  function renderSettingsLis() {
    return types.map((boxType) => {
      const typedBoxType = boxType as BoxType
      const listStyle = boxTypeStyle[typedBoxType]
      const listIcon = Object.hasOwn(listStyle, 'icon')
        ? listStyle.icon
        : undefined

      return (
        <li key={typedBoxType} className="inline-block pr-4 pb-4">
          <button
            className="ece-button-light"
            onClick={(event) => {
              event.preventDefault()
              type.set(typedBoxType)
              if (anchorId.value === '') generateAnchorId()
            }}
          >
            {listIcon ? <FaIcon className="mr-1" icon={listIcon} /> : null}
            {boxTypes[typedBoxType]}
          </button>
        </li>
      )
    })
  }

  function generateAnchorId() {
    anchorId.set(`box${Math.floor(10000 + Math.random() * 90000)}`)
  }
}