import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faComment,
  faEdit,
  faRedoAlt,
  faSave,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'

import { ToolbarButton } from './button'

export const savedBySerloString =
  'Diese Version wurde automatisch vom Serlo-Editor erstellt'

export interface ToolbarProps {
  mode: 'edit' | 'render'
  setIsEditing: Dispatch<SetStateAction<boolean>>
  setSaveVersionModalIsOpen?: Dispatch<SetStateAction<boolean>>
  hasUndoActions?: boolean
  hasRedoActions?: boolean
  save?: (comment?: string) => Promise<void>
  isSaving?: boolean
  hasPendingChanges: boolean
  dispatchUndo: () => void
  dispatchRedo: () => void
}

export function Toolbar({
  mode,
  setIsEditing,
  setSaveVersionModalIsOpen,
  hasUndoActions,
  hasRedoActions,
  save,
  isSaving,
  hasPendingChanges,
  dispatchUndo,
  dispatchRedo,
}: ToolbarProps) {
  const [shouldClose, setShouldClose] = useState(false)
  const canBeClosed = window.opener != null

  useEffect(() => {
    if (shouldClose && !hasPendingChanges) window.close()
  }, [hasPendingChanges, shouldClose])

  return (
    <nav className="edusharing-fixed edusharing-left-0 edusharing-right-0 edusharing-z-[100] edusharing-bg-sky-700/95">
      <div className="edusharing-mx-auto edusharing-flex edusharing-max-w-5xl edusharing-justify-between edusharing-py-2 edusharing-px-4 sm:edusharing-px-6 lg:edusharing-px-8">
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
          className="edusharing-ml-12"
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
          <ToolbarButton active={hasUndoActions} onClick={dispatchUndo}>
            <FontAwesomeIcon icon={faRedoAlt} flip="horizontal" /> Rückgängig
          </ToolbarButton>
          <ToolbarButton active={hasRedoActions} onClick={dispatchRedo}>
            <FontAwesomeIcon icon={faRedoAlt} /> Wiederholen
          </ToolbarButton>
        </div>
        {renderSaveInfo()}
        <div>
          <ToolbarButton
            className="edusharing-ml-12"
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
        className="edusharing-ml-12"
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
      <div className="edusharing-m-auto edusharing-text-xs edusharing-font-bold edusharing-text-white edusharing-opacity-50">
        {isSaving ? (
          <>
            Autom. Speichern <FontAwesomeIcon icon={faSpinner} spin />
          </>
        ) : hasPendingChanges ? (
          <>Nicht gespeicherte Änderungen</>
        ) : null}
      </div>
    )
  }
}
