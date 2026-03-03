'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useView } from '../context/ViewContext'
import Card from './Card'

export default function ProductPlanCard() {
  const { data, addLink, updateLink, removeLink } = useData()
  const { view } = useView()
  const [newLink, setNewLink] = useState('')
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')

  const items = data['product-plan'] || []
  const shouldHideAdmin = view === 'leadership'

  const handleAdd = () => {
    if (newLink.trim()) {
      addLink('product-plan', newLink.trim())
      setNewLink('')
    }
  }

  const handleEdit = (idx, link) => {
    setEditing(idx)
    setEditValue(link)
  }

  const handleSaveEdit = (idx) => {
    if (editValue.trim()) {
      updateLink('product-plan', idx, editValue.trim())
      setEditing(null)
      setEditValue('')
    }
  }

  return (
    <Card number="03" title="Review Product Plan">
      {items.length === 0 ? (
        <p className="empty-state">No product plan links yet.</p>
      ) : (
        <ul>
          {items.map((link, idx) => {
            const href = /^https?:\/\//i.test(link) ? link : 'https://' + link
            const displayText = link.length > 60 ? link.slice(0, 57) + '…' : link
            return (
              <li key={idx} className="list-item-has-link" style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
                {editing === idx ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                  <div className="list-item-link-wrap">
                    <a href={href} target="_blank" rel="noopener noreferrer" className="list-item-link">
                      {displayText}
                    </a>
                    {!shouldHideAdmin && (
                      <>
                        <button
                          type="button"
                          className="btn-edit admin-only"
                          onClick={() => handleEdit(idx, link)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-only"
                          onClick={() => removeLink('product-plan', idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            lineHeight: '1',
                            padding: '0'
                          }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {!shouldHideAdmin && (
        <div className="add-item admin-only">
          <input
            type="text"
            placeholder="Paste product plan link (URL)..."
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
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
