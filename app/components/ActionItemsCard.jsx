'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useView } from '../context/ViewContext'
import Card from './Card'

export default function ActionItemsCard() {
  const { data, addActionItem, updateActionItem, removeActionItem } = useData()
  const { view } = useView()
  const [newText, setNewText] = useState('')
  const [newStatus, setNewStatus] = useState('Not Started')
  const [newNotes, setNewNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState({})

  const items = data['action-items'] || []

  const handleAdd = () => {
    if (newText.trim()) {
      addActionItem(newText.trim(), newStatus, newNotes.trim())
      setNewText('')
      setNewStatus('Not Started')
      setNewNotes('')
    }
  }

  const statusColors = {
    'Not Started': 'status-not-started',
    'In Progress': 'status-in-progress',
    'Completed': 'status-completed',
    'On Hold': 'status-on-hold',
    'Cancelled': 'status-cancelled'
  }

  const shouldHideAdmin = view === 'leadership'

  return (
    <Card number="01" title="Action Items &amp; Followups">
      {items.length === 0 ? (
        <p className="empty-state">No action items yet. Add one below.</p>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li key={idx} className="action-item-row">
              <div className="row-top">
                <span className="row-title">{item.text}</span>
                <div className="row-meta">
                  <select
                    className={`status-select ${statusColors[item.status] || 'status-not-started'}`}
                    value={item.status}
                    onChange={(e) => updateActionItem(idx, { status: e.target.value })}
                    disabled={shouldHideAdmin}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {!shouldHideAdmin && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeActionItem(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              {item.notes && (
                <div className="row-notes">{item.notes}</div>
              )}
              {!shouldHideAdmin && (
                <button
                  type="button"
                  className="btn-edit-notes"
                  onClick={() => setEditingNotes(prev => ({ ...prev, [idx]: !prev[idx] }))}
                >
                  {item.notes ? 'Edit notes' : 'Add notes'}
                </button>
              )}
              {editingNotes[idx] && !shouldHideAdmin && (
                <div className="notes-edit">
                  <textarea
                    placeholder="Notes / comments..."
                    value={item.notes}
                    onChange={(e) => updateActionItem(idx, { notes: e.target.value })}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!shouldHideAdmin && (
        <div className="action-item-form admin-only">
          <div className="form-row">
            <input
              type="text"
              className="action-input"
              placeholder="Action item..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select
              className={`status-select-form ${statusColors[newStatus] || 'status-not-started'}`}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button type="button" className="add-btn" onClick={handleAdd}>
              Add
            </button>
          </div>
          <div className="form-row">
            <textarea
              placeholder="Notes / comments (optional)..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </Card>
  )
}

