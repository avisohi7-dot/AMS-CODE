import { ArchiveRestore, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import { AreaPill, Card, EmptyState, IconButton, PageHeader, TagPill, fmtDate } from '../components/ui'

export function ArchivePage() {
  const projects = useBrainStore((s) => s.projects.filter((p) => p.archived))
  const resources = useBrainStore((s) => s.resources.filter((r) => r.archived))
  const archiveProject = useBrainStore((s) => s.archiveProject)
  const archiveResource = useBrainStore((s) => s.archiveResource)
  const deleteProject = useBrainStore((s) => s.deleteProject)
  const deleteResource = useBrainStore((s) => s.deleteResource)

  const isEmpty = projects.length === 0 && resources.length === 0

  return (
    <div>
      <PageHeader
        title="Archive"
        description="Inactive projects and resources — kept for reference, out of your active view."
      />

      {isEmpty ? (
        <EmptyState
          title="Archive is empty"
          description="Archived projects and resources will show up here so your active views stay focused."
        />
      ) : (
        <div className="space-y-6">
          {projects.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Projects · {projects.length}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((p) => (
                  <Card key={p.id} className="p-4 opacity-80">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink-primary">{p.title}</h3>
                      <AreaPill area={p.area} />
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {p.dueDate ? `Was due ${fmtDate(p.dueDate)}` : 'No due date'}
                    </p>
                    <div className="mt-3 flex justify-end gap-1.5">
                      <IconButton label="Restore" onClick={() => archiveProject(p.id, false)}>
                        <ArchiveRestore size={14} />
                      </IconButton>
                      <IconButton label="Delete permanently" danger onClick={() => deleteProject(p.id)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Resources · {resources.length}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {resources.map((r) => (
                  <Card key={r.id} className="p-4 opacity-80">
                    <h3 className="text-sm font-semibold text-ink-primary">{r.title}</h3>
                    {r.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.tags.map((t) => (
                          <TagPill key={t} label={t} />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex justify-end gap-1.5">
                      <IconButton label="Restore" onClick={() => archiveResource(r.id, false)}>
                        <ArchiveRestore size={14} />
                      </IconButton>
                      <IconButton label="Delete permanently" danger onClick={() => deleteResource(r.id)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
