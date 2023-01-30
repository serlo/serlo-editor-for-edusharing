import clsx from 'clsx'
import { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className={clsx(
          'max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose lg:prose-lg',
          'prose-stone prose-headings:text-stone-800 prose-h1:font-bold',
          'prose-a:text-sky-500'
        )}
      >
        {children}
      </div>

      <style jsx global>{`
        a:not([href]) {
          text-decoration: none;
        }
      `}</style>
    </>
  )
}
