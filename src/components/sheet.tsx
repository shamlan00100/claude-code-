import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { useT } from '#/i18n'

/**
 * Bottom sheet on the native <dialog>: focus is trapped, Escape closes it,
 * and a tap on the scrim closes it. The only component with a shadow.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="sheet m-0 mt-auto w-full max-w-none bg-transparent p-0 text-iron backdrop:bg-iron/40"
    >
      <div className="mx-auto flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-lg bg-raised shadow-[var(--sheet-shadow)]">
        <div className="flex justify-center pt-3" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-hairline" />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 pt-3 pb-2">
          <h2 id="sheet-title" className="type-heading text-iron">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-2 type-detail text-rock"
          >
            {t.sheet.close}
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </dialog>
  )
}
