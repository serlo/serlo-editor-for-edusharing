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
        'px-1.5 py-1 border border-transparent rounded-xl shadow-sm text-white text-sm font-medium bg-sky-800/0 hover:bg-sky-800 hover:opacity-100 ml-1',
        className,
        active ? 'opacity-90' : 'opacity-50 cursor-not-allowed'
      )}
      disabled={active ? undefined : true}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
