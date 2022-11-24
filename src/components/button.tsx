import { MouseEvent } from 'react'

interface ButtonProps {
  onClick?: (event?: MouseEvent) => void
  children?: React.ReactNode
}

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="block rounded-md px-2 py-1 text-white bg-sky-800 absolute right-2 bottom-2 focus:bg-sky-500"
    >
      {children}
    </button>
  )
}
