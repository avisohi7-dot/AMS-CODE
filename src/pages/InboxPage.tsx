import { useState } from 'react'
import { FileText, ListTodo, Plus, Library, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import { Button, Card, EmptyState, IconButton, PageHeader } from '../components/ui'
import { QuickCaptureModal } from '../components/QuickCapture'

export function InboxPage() {
  const inbox = useBrainStore((s) => s.inbox)
  const addInboxItem = useBrainStore((s) => s.addInboxItem)
  const deleteInboxItem = useBrainStore((s) => s.deleteInboxItem)
  const convertInboxItemToTask = useBrainStore((s) => s.convertInboxItemToTask)
  const convertInboxItemToNote = useBrainStore((s) => s.convertInboxItemToNote)
  const convertInboxItemToResource = useBrainStore((s) => s.convertInboxItemToResource)

  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Everything you've captured but haven't sorted yet. Triage it into tasks, notes, or resources."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Capture
          </Button>
        }
      />

      {inbox.length === 0 ? (
        <EmptyState
          title="Inbox zero"
          description="Nothing waiting to be sorted. Press C anywhere to capture a quick thought."
        />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {inbox.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-primary">{item.content}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <IconButton label="Convert to task" onClick={() => convertInboxItemToTask(item.id)}>
                  <ListTodo size={14} />
                </IconButton>
                <IconButton label="Convert to note" onClick={() => convertInboxItemToNote(item.id)}>
                  <FileText size={14} />
                </IconButton>
                <IconButton label="Convert to resource" onClick={() => convertInboxItemToResource(item.id)}>
                  <Library size={14} />
                </IconButton>
                <IconButton label="Discard" danger onClick={() => deleteInboxItem(item.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          ))}
        </Card>
      )}

      <QuickCaptureModal open={open} onClose={() => setOpen(false)} onSubmit={addInboxItem} />
    </div>
  )
}
