import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Area } from '../types'
import { Button, Card, IconButton, PageHeader, areaAccent } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

export function Areas() {
  const areas = useBrainStore((s) => s.areas)
  const projects = useBrainStore((s) => s.projects)
  const goals = useBrainStore((s) => s.goals)
  const updateArea = useBrainStore((s) => s.updateArea)

  const [editing, setEditing] = useState<Area | null>(null)
  const [form, setForm] = useState({ description: '', standard: '' })

  function openEdit(area: Area) {
    setEditing(area)
    setForm({ description: area.description, standard: area.standard })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    updateArea(editing.id, form)
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Areas"
        description="Ongoing standards to maintain over time — no end date, just consistency."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => {
          const projectCount = projects.filter((p) => p.area === area.name && !p.archived).length
          const goalCount = goals.filter((g) => g.area === area.name).length
          return (
            <Card key={area.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: areaAccent(area.name) }}
                  />
                  <h3 className="text-sm font-semibold text-ink-primary">{area.name}</h3>
                </div>
                <IconButton label="Edit" onClick={() => openEdit(area)}>
                  <Pencil size={14} />
                </IconButton>
              </div>
              <p className="mt-2 text-sm text-ink-secondary">{area.description}</p>
              <p className="mt-2 rounded-lg bg-surface-plane px-2.5 py-1.5 text-xs text-ink-secondary">
                Standard: {area.standard}
              </p>
              <div className="mt-3 flex gap-4 text-xs text-ink-muted">
                <span>{projectCount} active project{projectCount === 1 ? '' : 's'}</span>
                <span>{goalCount} goal{goalCount === 1 ? '' : 's'}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name ?? ''}`}>
        <form onSubmit={submit}>
          <FormRow label="Description">
            <textarea
              className={inputClass}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormRow>
          <FormRow label="Standard to maintain">
            <input
              className={inputClass}
              value={form.standard}
              onChange={(e) => setForm({ ...form, standard: e.target.value })}
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
