import { redo, undo } from '@edtr-io/store'
import { faRedoAlt } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import { Dispatch, SetStateAction, useState } from 'react'
import clsx from 'clsx'
import { useScopedDispatch } from '@edtr-io/core'

export interface ToolbarProps {
  mode: 'edit' | 'render'
  setIsEditing: Dispatch<SetStateAction<boolean>>
  setSaveVersionModalIsOpen?: Dispatch<SetStateAction<boolean>>
  undoable?: boolean
  redoable?: boolean
  hasPendingChanges?: boolean
  save?: (comment?: string) => Promise<void>
}

export function Toolbar({
  mode,
  setIsEditing,
  setSaveVersionModalIsOpen,
  undoable,
  redoable,
  hasPendingChanges,
  save,
}: ToolbarProps) {
  const dispatch = useScopedDispatch()

  const getButtonActiveClass = (active: boolean) => {
    return active ? 'opacity-90' : 'opacity-50 cursor-not-allowed'
  }

  const toolbarButtonClasses =
    'px-1.5 py-1 border border-transparent rounded-xl shadow-sm text-white text-sm font-medium bg-sky-800/0 hover:bg-sky-800 hover:opacity-100 ml-1'

  return (
    <nav className="fixed z-10 left-0 right-0 bg-sky-700/95">
      <div className="max-w-6xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex">
        {mode === 'render' ? renderRenderButtons() : renderEditButtons()}
      </div>
    </nav>
  )

  function renderRenderButtons() {
    return (
      <>
        <button
          className={clsx(
            toolbarButtonClasses,
            'ml-12',
            getButtonActiveClass(true)
          )}
          onClick={async () => {
            setIsEditing(true)
          }}
        >
          <FontAwesomeIcon icon={faEdit} /> Bearbeiten
        </button>
      </>
    )
  }

  function renderEditButtons() {
    return (
      <>
        <button
          type="button"
          className={clsx(toolbarButtonClasses, getButtonActiveClass(undoable))}
          disabled={!undoable}
          onClick={() => {
            dispatch(undo())
          }}
        >
          <FontAwesomeIcon icon={faRedoAlt} flip="horizontal" /> Undo
        </button>
        <button
          type="button"
          className={clsx(toolbarButtonClasses, getButtonActiveClass(redoable))}
          disabled={!redoable}
          onClick={() => {
            dispatch(redo())
          }}
        >
          <FontAwesomeIcon icon={faRedoAlt} /> Redo
        </button>
        <button
          type="button"
          className={clsx(
            toolbarButtonClasses,
            'ml-12',
            getButtonActiveClass(hasPendingChanges)
          )}
          disabled={!hasPendingChanges}
          onClick={async () => {
            await save()
          }}
        >
          <FontAwesomeIcon icon={faSave} /> Save
        </button>
        <button
          type="button"
          className={clsx(toolbarButtonClasses, 'ml-12')}
          onClick={() => setSaveVersionModalIsOpen(true)}
        >
          <FontAwesomeIcon icon={faSave} /> Versionskommentar
        </button>
      </>
    )
  }
}
