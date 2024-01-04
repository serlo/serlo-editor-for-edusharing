import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import Modal from 'react-modal'

export interface SaveVersionModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  save?: (comment?: string) => Promise<void>
}

export function SaveVersionModal({
  open,
  save,
  setOpen,
}: SaveVersionModalProps) {
  const commentInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (commentInput.current) commentInput.current?.focus()
      }, 10)
    }
  }, [open])

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => setOpen(false)}
      style={{
        overlay: {
          zIndex: '999',
        },
        content: {
          marginTop: '4rem',
          left: '50%',
          bottom: 'auto',
          right: 'auto',
          transform: 'translateX(-50%)',
          zIndex: '99',
        },
      }}
    >
      <p>Erstelle und speichere eine neue Version:</p>
      <input
        type="text"
        className="edusharing-mt-3 edusharing-block edusharing-w-full edusharing-rounded-md edusharing-border edusharing-border-gray-300 edusharing-p-2 focus-visible:edusharing-outline-sky-800"
        ref={commentInput}
        size={50}
        placeholder="Name der neuen Version"
      />
      <div className="edusharing-mt-3 edusharing-text-right">
        <button
          className="edusharing-ece-button-blue-transparent edusharing-mr-3 edusharing-text-base"
          onClick={() => setOpen(false)}
        >
          Schließen
        </button>
        <button
          className="edusharing-ece-button-blue edusharing-text-base"
          onClick={async () => {
            await save(commentInput.current?.value)
            setOpen(false)
          }}
        >
          Speichern
        </button>
      </div>
    </Modal>
  )
}
