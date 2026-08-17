import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './ui'

export function QuickCaptureModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (content: string) => void
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setValue('')
      setTimeout(() => ref.current?.focus(), 0)
    }
  }, [open])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick capture">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            submit()
          }
        }}
        rows={3}
        placeholder="Capture anything — sort it later…"
        className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand-1"
      />
      <p className="mt-1.5 text-xs text-ink-muted">Lands in your Inbox. ⌘/Ctrl + Enter to save.</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>Save to inbox</Button>
      </div>
    </Modal>
  )
}
