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
        'edusharing-ml-1 edusharing-rounded-xl edusharing-border edusharing-border-transparent edusharing-bg-sky-800/0 edusharing-px-1.5 edusharing-py-1 edusharing-text-sm edusharing-font-medium edusharing-text-white edusharing-shadow-sm hover:edusharing-bg-sky-800 hover:edusharing-opacity-100',
        className,
        active
          ? 'edusharing-opacity-90'
          : 'edusharing-cursor-not-allowed edusharing-opacity-50',
      )}
      disabled={active ? undefined : true}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
