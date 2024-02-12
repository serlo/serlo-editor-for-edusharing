import clsx from 'clsx'
import { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className={clsx(
          'edusharing-prose lg:edusharing-prose-lg edusharing-mx-auto edusharing-max-w-5xl edusharing-py-2 edusharing-px-4 sm:edusharing-px-6 lg:edusharing-px-8',
          'edusharing-prose-stone prose-headings:edusharing-text-stone-800 prose-h1:edusharing-font-bold',
          'prose-a:edusharing-text-sky-500',
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
