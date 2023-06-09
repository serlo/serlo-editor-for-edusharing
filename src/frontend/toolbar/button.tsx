import { ReactNode } from 'react'
import clsx from 'clsx'

export interface ToolbarButtonProps {
  children: ReactNode
  active: boolean
  onClick: () => void
  className?: string
}

export function ToolbarButton({
  children,
  active,
  onClick,
  className,
}: ToolbarButtonProps) {
  return (
    <button
      className={clsx(
        'ml-1 rounded-xl border border-transparent bg-sky-800/0 px-1.5 py-1 text-sm font-medium text-white shadow-sm hover:bg-sky-800 hover:opacity-100',
        className,
        active ? 'opacity-90' : 'cursor-not-allowed opacity-50'
      )}
      disabled={active ? undefined : true}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
