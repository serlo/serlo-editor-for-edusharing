import { redo, undo } from '@edtr-io/store'
import { faCheck, faRedoAlt, faSpinner } from '@edtr-io/ui'
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
  const dispatch = useScopedDispatch()

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
          <ToolbarButton
            className="ml-12"
            active={true}
            onClick={async () => {
              // TODO: I think save does not change hasPendingChanges right now?
              // this triggers a confusing promt right now
              await save(
                'Diese Version wurde automatisch vom Serlo-Editor erstellt'
              )
              // this will only work reliably if this tab was opened with window.open (not target="_blank") for example
              setTimeout(() => {
                window.close()
              }, 10)
            }}
          >
            <FontAwesomeIcon icon={faSave} /> Speichern & Schließen
          </ToolbarButton>
        </div>
      </>
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
