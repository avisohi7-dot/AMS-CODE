import { useState } from 'react'
import { Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Contact, ContactTag } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

const TAGS: ContactTag[] = ['Work', 'Friends', 'Family', 'Relatives', 'Services']

const TAG_COLOR: Record<ContactTag, string> = {
  Work: 'var(--series-3)',
  Friends: 'var(--series-1)',
  Family: 'var(--series-8)',
  Relatives: 'var(--series-5)',
  Services: 'var(--series-4)',
}

type FormState = { name: string; phone: string; email: string; tag: ContactTag }
const EMPTY_FORM: FormState = { name: '', phone: '', email: '', tag: 'Work' }

export function Contacts() {
  const contacts = useBrainStore((s) => s.contacts)
  const addContact = useBrainStore((s) => s.addContact)
  const updateContact = useBrainStore((s) => s.updateContact)
  const deleteContact = useBrainStore((s) => s.deleteContact)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(c: Contact) {
    setEditingId(c.id)
    setForm({ name: c.name, phone: c.phone, email: c.email, tag: c.tag })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      tag: form.tag,
    }
    if (editingId) updateContact(editingId, payload)
    else addContact(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People you reach out to — quick access to phone and email."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New contact
          </Button>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState title="No contacts yet" description="Add the people you keep in touch with." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contacts.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">{c.name}</h3>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ color: TAG_COLOR[c.tag], backgroundColor: TAG_COLOR[c.tag] + '1a' }}
                >
                  {c.tag}
                </span>
              </div>
              {c.phone && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary">
                  <Phone size={13} /> {c.phone}
                </p>
              )}
              {c.email && <p className="mt-1 truncate text-xs text-ink-muted">{c.email}</p>}
              <div className="mt-3 flex justify-end gap-1.5">
                <IconButton label="Edit" onClick={() => openEdit(c)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton label="Delete" danger onClick={() => deleteContact(c.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit contact' : 'New contact'}>
        <form onSubmit={submit}>
          <FormRow label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Phone">
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormRow>
            <FormRow label="Tag">
              <select
                className={inputClass}
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value as ContactTag })}
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormRow>
          </div>
          <FormRow label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add contact'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
