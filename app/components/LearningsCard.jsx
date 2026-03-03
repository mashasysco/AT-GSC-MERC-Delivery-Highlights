'use client'

import { useState } from 'react'
import { useView } from '../context/ViewContext'
import { useData } from '../context/DataContext'
import Card from './Card'

export default function LearningsCard() {
  const { data, addLearning, updateLearning, removeLearning } = useData()
  const { view } = useView()
  const [newLearning, setNewLearning] = useState('')
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')

  const items = data.learnings || []
  const shouldHideAdmin = view === 'leadership'

  const handleAdd = () => {
    if (newLearning.trim()) {
      addLearning(newLearning.trim())
      setNewLearning('')
    }
  }

  const handleEdit = (idx, item) => {
    setEditing(idx)
    setEditValue(item)
  }

  const handleSaveEdit = (idx) => {
    if (editValue.trim()) {
      updateLearning(idx, editValue.trim())
      setEditing(null)
      setEditValue('')
    }
  }

  return (
    <Card number="05" title="New Learnings / Improvements">
      {items.length === 0 ? (
        <p className="empty-state">No learnings or improvements yet.</p>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              {editing === idx ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(idx)}
                    style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span>{item}</span>
                  {!shouldHideAdmin && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => handleEdit(idx, item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-only"
                        onClick={() => removeLearning(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '1.2em',
                          lineHeight: '1',
                          padding: '0',
                          flexShrink: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {!shouldHideAdmin && (
        <div className="add-item admin-only">
          <input
            type="text"
            placeholder="Add learning or improvement..."
            value={newLearning}
            onChange={(e) => setNewLearning(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button type="button" onClick={handleAdd}>
            Add
          </button>
        </div>
      )}
    </Card>
  )
}
