import { redo, undo } from '@edtr-io/store'
import { faCheck, faRedoAlt, faSpinner } from '@edtr-io/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useScopedDispatch, useScopedSelector } from '@edtr-io/core'
import { ToolbarButton } from './button'
import { hasPendingChanges as hasPendingChangesSelector } from '@edtr-io/store'

export const savedBySerloString =
  'Diese Version wurde automatisch vom Serlo-Editor erstellt'

export interface ToolbarProps {
  mode: 'edit' | 'render'
  setIsEditing: Dispatch<SetStateAction<boolean>>
  setSaveVersionModalIsOpen?: Dispatch<SetStateAction<boolean>>
  undoable?: boolean
  redoable?: boolean
  save?: (comment?: string) => Promise<void>
  isSaving?: boolean
}

export function Toolbar({
  mode,
  setIsEditing,
  setSaveVersionModalIsOpen,
  undoable,
  redoable,
  save,
  isSaving,
}: ToolbarProps) {
  const [shouldClose, setShouldClose] = useState(false)
  const dispatch = useScopedDispatch()
  const canBeClosed = window.opener != null || window.history.length == 1
  const hasPendingChanges = useScopedSelector(hasPendingChangesSelector())

  useEffect(() => {
    window.onbeforeunload = () => {
      if(hasPendingChanges) {
        return 'Deine Änderungen wurden noch nicht gespeichert.'
      }
    }
  }, [hasPendingChanges])

  useEffect(() => {
    if (shouldClose && !hasPendingChanges) window.close()
  }, [hasPendingChanges, shouldClose])

  return (
    <nav className="fixed z-10 left-0 right-0 bg-sky-700/95">
      <div className="max-w-5xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex justify-between">
        {mode === 'render' ? renderRenderButtons() : renderEditButtons()}
      </div>
    </nav>
  )

  function renderRenderButtons() {
    return (
      <>
        <ToolbarButton
          active
          onClick={() => setIsEditing(true)}
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
        <div>
          <ToolbarButton active={undoable} onClick={() => dispatch(undo())}>
            <FontAwesomeIcon icon={faRedoAlt} flip="horizontal" /> Rückgängig
          </ToolbarButton>
          <ToolbarButton active={redoable} onClick={() => dispatch(redo())}>
            <FontAwesomeIcon icon={faRedoAlt} /> Wiederholen
          </ToolbarButton>
        </div>
        {renderSaveInfo()}
        <div>
          <ToolbarButton
            className="ml-12"
            active
            onClick={() => setSaveVersionModalIsOpen(true)}
          >
            <FontAwesomeIcon icon={faComment} flip="horizontal" /> Benannte
            Version speichern
          </ToolbarButton>
          {renderManualSaveButton()}
        </div>
      </>
    )
  }

  function renderManualSaveButton() {
    if (save == null) return
    return (
      <ToolbarButton
        className="ml-12"
        active
        onClick={async () => {
          await save(savedBySerloString)
          if (canBeClosed) setShouldClose(true)
        }}
      >
        <FontAwesomeIcon icon={faSave} /> Speichern
        {canBeClosed ? ' & Schließen' : ''}
      </ToolbarButton>
    )
  }

  function renderSaveInfo() {
    return (
      <div className="text-white text-xs font-bold opacity-50 m-auto">
        {isSaving ? (
          <>
            Autom. Speichern <FontAwesomeIcon icon={faSpinner} spin />
          </>
        ) : (
          <>
            Gespeichert <FontAwesomeIcon icon={faCheck} />
          </>
        )}
      </div>
    )
  }
}
