import { redo, undo } from '@edtr-io/store'
import { faRedoAlt } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
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
        <ToolbarButton
          className="ml-12"
          active
          onClick={() => setSaveVersionModalIsOpen(true)}
        >
          <FontAwesomeIcon icon={faComment} flip="horizontal" /> Version
          benennen
        </ToolbarButton>
        <ToolbarButton
          className="ml-12"
          active={true}
          onClick={async () => {
            // TODO: I think save does not change hasPendingChanges right now?
            // this triggers a confusing promt right now
            await save()
            // this will only work reliably if this tab was opened with window.open (not target="_blank") for example
            setTimeout(() => {
              window.close()
            }, 10)
          }}
        >
          <FontAwesomeIcon icon={faSave} /> Speichern & Schließen
        </ToolbarButton>
      </>
    )
  }
}
