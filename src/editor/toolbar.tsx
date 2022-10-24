import { redo, undo } from '@edtr-io/store'
import { faRedoAlt } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import { Dispatch, SetStateAction } from 'react'
import { useScopedDispatch } from '@edtr-io/core'
import { ToolbarButton } from './toolbar-button'

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
        <ToolbarButton
          active
          onClick={async () => {
            setIsEditing(true)
          }}
          className="ml-12"
        >
          <FontAwesomeIcon icon={faEdit} /> Bearbeiten
        </ToolbarButton>
      </>
    )
  }

  function renderEditButtons() {
    return (
      <>
        <ToolbarButton active={undoable} onClick={() => dispatch(undo())}>
          <FontAwesomeIcon icon={faRedoAlt} flip="horizontal" /> Rückgängig
        </ToolbarButton>
        <ToolbarButton active={redoable} onClick={() => dispatch(redo())}>
          <FontAwesomeIcon icon={faRedoAlt} /> Wiederholen
        </ToolbarButton>
        {/* TODO: maybe remove or add notice about autosave */}
        <ToolbarButton
          className="ml-12"
          active={hasPendingChanges}
          onClick={async () => await save()}
        >
          <FontAwesomeIcon icon={faSave} /> Speichern
        </ToolbarButton>
        <ToolbarButton
          className="ml-12"
          active
          onClick={() => setSaveVersionModalIsOpen(true)}
        >
          <FontAwesomeIcon icon={faSave} /> Versionskommentar
        </ToolbarButton>
      </>
    )
  }
}
