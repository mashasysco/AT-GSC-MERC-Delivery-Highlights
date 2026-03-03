'use client'

import { useState } from 'react'
import { useView } from '../context/ViewContext'
import { useData } from '../context/DataContext'
import Card from './Card'

export default function ReleasesCard() {
  const { data, addRelease, updateRelease, removeRelease } = useData()
  const { view } = useView()
  const [newRelease, setNewRelease] = useState({
    releaseName: '',
    releaseDate: '',
    releaseOpCo: '',
    releaseStatus: 'Planned'
  })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const items = data.releases || []
  const shouldHideAdmin = view === 'leadership'

  const statusColors = {
    'Planned': 'planned',
    'In Progress': 'in-progress',
    'Released': 'released',
    'Deferred': 'deferred'
  }

  const handleAdd = () => {
    if (newRelease.releaseName.trim()) {
      addRelease(
        newRelease.releaseName.trim(),
        newRelease.releaseDate.trim(),
        newRelease.releaseOpCo.trim(),
        newRelease.releaseStatus
      )
      setNewRelease({
        releaseName: '',
        releaseDate: '',
        releaseOpCo: '',
        releaseStatus: 'Planned'
      })
    }
  }

  const handleEdit = (idx, release) => {
    setEditing(idx)
    setEditForm({ ...release })
  }

  const handleSaveEdit = (idx) => {
    if (editForm.releaseName.trim()) {
      updateRelease(idx, editForm)
      setEditing(null)
      setEditForm({})
    }
  }

  return (
    <Card number="06" title="Upcoming Releases">
      {items.length === 0 ? (
        <p className="empty-state">No upcoming releases yet. Add one below.</p>
      ) : (
        <ul>
          {items.map((release, idx) => (
            <li key={idx} className="release-row">
              {editing === idx ? (
                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Release name"
                    value={editForm.releaseName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, releaseName: e.target.value }))}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontSize: '0.875rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Release date"
                    value={editForm.releaseDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontSize: '0.875rem' }}
                  />
                  <input
                    type="text"
                    placeholder="OpCo"
                    value={editForm.releaseOpCo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, releaseOpCo: e.target.value }))}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontSize: '0.875rem' }}
                  />
                  <select
                    value={editForm.releaseStatus}
                    onChange={(e) => setEditForm(prev => ({ ...prev, releaseStatus: e.target.value }))}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontSize: '0.875rem' }}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Released">Released</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row-head">
                    <span className="row-name">{release.releaseName}</span>
                    {!shouldHideAdmin && (
                      <div>
                        <button type="button" className="btn-edit admin-only" onClick={() => handleEdit(idx, release)}>
                          Edit
                        </button>
                        <button type="button" className="btn-remove admin-only" onClick={() => removeRelease(idx)}>
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="row-meta">
                    <span><strong>Date:</strong> {release.releaseDate}</span>
                    <span><strong>OpCo:</strong> {release.releaseOpCo}</span>
                    <span>
                      <strong>Status:</strong>{' '}
                      <span className={`release-status-badge ${statusColors[release.releaseStatus] || 'planned'}`}>
                        {release.releaseStatus}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {!shouldHideAdmin && (
        <div className="releases-form admin-only">
          <div className="form-row">
            <input
              type="text"
              className="field-release-name"
              placeholder="Release name"
              value={newRelease.releaseName}
              onChange={(e) => setNewRelease(prev => ({ ...prev, releaseName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <input
              type="text"
              className="field-release-date"
              placeholder="Release date"
              value={newRelease.releaseDate}
              onChange={(e) => setNewRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
            />
            <input
              type="text"
              className="field-opco"
              placeholder="Release OpCo"
              value={newRelease.releaseOpCo}
              onChange={(e) => setNewRelease(prev => ({ ...prev, releaseOpCo: e.target.value }))}
            />
            <select
              className="release-status-select"
              value={newRelease.releaseStatus}
              onChange={(e) => setNewRelease(prev => ({ ...prev, releaseStatus: e.target.value }))}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Released">Released</option>
              <option value="Deferred">Deferred</option>
            </select>
            <button type="button" className="add-btn" onClick={handleAdd}>
              Add
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
