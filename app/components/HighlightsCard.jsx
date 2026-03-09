'use client'

import { useState } from 'react'
import { useView } from '../context/ViewContext'
import { useData } from '../context/DataContext'
import Card from './Card'

export default function HighlightsCard() {
  const {
    data,
    addTeam,
    removeTeam,
    updateTeamName,
    addInitiative,
    updateInitiative,
    removeInitiative,
    addReleaseToInitiative,
    updateReleaseInInitiative,
    removeReleaseFromInitiative
  } = useData()
  const { view } = useView()
  const [newTeamName, setNewTeamName] = useState('')
  const [editingInit, setEditingInit] = useState(null)
  const [editingRelease, setEditingRelease] = useState(null)
  const [formData, setFormData] = useState({})

  const teams = data.highlights || []
  const shouldHideAdmin = view === 'leadership'

  const ragColors = {
    'Red': 'rag-red',
    'Amber': 'rag-amber',
    'Green': 'rag-green'
  }

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim())
      setNewTeamName('')
    }
  }

  const handleEditTeam = (teamIndex) => {
    const newName = prompt('Team name:', teams[teamIndex].teamName)
    if (newName && newName.trim()) {
      updateTeamName(teamIndex, newName.trim())
    }
  }

  const handleEditInitiative = (teamIndex, initIndex, init) => {
    setEditingInit({ teamIndex, initIndex })
    setFormData({
      name: init.name,
      keyHighlights: init.keyHighlights,
      rag: init.rag,
      eta: init.eta,
      raid: init.raid,
      challenges: init.challenges
    })
  }

  const handleSaveInitiative = () => {
    const { teamIndex, initIndex } = editingInit
    updateInitiative(teamIndex, initIndex, formData)
    setEditingInit(null)
    setFormData({})
  }

  const handleEditRelease = (teamIndex, initIndex, releaseIndex, release) => {
    setEditingRelease({ teamIndex, initIndex, releaseIndex })
    setFormData({
      releaseName: release.releaseName,
      releaseDate: release.releaseDate
    })
  }

  const handleSaveRelease = () => {
    const { teamIndex, initIndex, releaseIndex } = editingRelease
    updateReleaseInInitiative(teamIndex, initIndex, releaseIndex, formData)
    setEditingRelease(null)
    setFormData({})
  }

  return (
    <Card number="02" title="Delivery Highlights &amp; Challenges">
      {teams.length === 0 ? (
        <p className="empty-state">No teams yet. Add a team below.</p>
      ) : (
        <ul>
          {teams.map((team, teamIdx) => (
            <li key={teamIdx} style={{ listStyle: 'none', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                    {team.teamName}
                  </h3>
                  {!shouldHideAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => handleEditTeam(teamIdx)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeTeam(teamIdx)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
<div className='grid'>
                {team.initiatives && team.initiatives.map((init, initIdx) => (
                  <div key={initIdx} className={`highlight-row ${ragColors[init.rag] || 'rag-green'}`}>
                    <div className="row-header">
                      <div style={{ flex: 1 }}>
                        <div className="row-team">{init.name}</div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`row-rag ${ragColors[init.rag] || 'rag-green'}`}>{init.rag}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong>ETA:</strong> {init.eta}
                          </span>
                          {!shouldHideAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                              <button
                                type="button"
                                className="btn-edit"
                                onClick={() => handleEditInitiative(teamIdx, initIdx, init)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-remove"
                                onClick={() => removeInitiative(teamIdx, initIdx)}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {editingInit?.teamIndex === teamIdx && editingInit?.initIndex === initIdx ? (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <input
                          type="text"
                          placeholder="Initiative name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          style={{ width: '100%', marginBottom: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit' }}
                        />
                        <textarea
                          placeholder="Key highlights"
                          value={formData.keyHighlights}
                          onChange={(e) => setFormData(prev => ({ ...prev, keyHighlights: e.target.value }))}
                          style={{ width: '100%', marginBottom: '0.5rem', minHeight: '60px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        <select
                          value={formData.rag}
                          onChange={(e) => setFormData(prev => ({ ...prev, rag: e.target.value }))}
                          style={{ marginBottom: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit' }}
                        >
                          <option value="Green">Green</option>
                          <option value="Amber">Amber</option>
                          <option value="Red">Red</option>
                        </select>
                        <input
                          type="text"
                          placeholder="ETA"
                          value={formData.eta}
                          onChange={(e) => setFormData(prev => ({ ...prev, eta: e.target.value }))}
                          style={{ width: '100%', marginBottom: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit' }}
                        />
                        <textarea
                          placeholder="RAID"
                          value={formData.raid}
                          onChange={(e) => setFormData(prev => ({ ...prev, raid: e.target.value }))}
                          style={{ width: '100%', marginBottom: '0.5rem', minHeight: '60px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        <textarea
                          placeholder="Challenges"
                          value={formData.challenges}
                          onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                          style={{ width: '100%', marginBottom: '0.75rem', minHeight: '60px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-save"
                            onClick={handleSaveInitiative}
                            style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setEditingInit(null)}
                            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {init.keyHighlights && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                            <strong>Key Highlights:</strong> {init.keyHighlights}
                          </div>
                        )}
                        {init.raid && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>RAID:</strong> {init.raid}
                          </div>
                        )}
                        {init.challenges && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>Challenges:</strong> {init.challenges}
                          </div>
                        )}
                        {init.releases && init.releases.length > 0 && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                            {init.releases.map((release, relIdx) => (
                              <div key={relIdx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span>
                                  {release.releaseName}
                                  {release.releaseDate && ` (${release.releaseDate})`}
                                </span>
                                {!shouldHideAdmin && (
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                      type="button"
                                      className="btn-edit"
                                      onClick={() => handleEditRelease(teamIdx, initIdx, relIdx, release)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-remove"
                                      onClick={() => removeReleaseFromInitiative(teamIdx, initIdx, relIdx)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {editingRelease?.teamIndex === teamIdx && editingRelease?.initIndex === initIdx && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Release name"
                              value={formData.releaseName}
                              onChange={(e) => setFormData(prev => ({ ...prev, releaseName: e.target.value }))}
                              style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem', color: 'var(--text)', fontSize: '0.875rem' }}
                            />
                            <input
                              type="text"
                              placeholder="Release date"
                              value={formData.releaseDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                              style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem', color: 'var(--text)', fontSize: '0.875rem' }}
                            />
                            <button
                              type="button"
                              onClick={handleSaveRelease}
                              style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRelease(null)}
                              style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {!shouldHideAdmin && (
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => addReleaseToInitiative(teamIdx, initIdx)}
                            style={{ marginTop: '0.35rem' }}
                          >
                            + Add Release
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
</div>
                {!shouldHideAdmin && (
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => addInitiative(teamIdx)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Initiative
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!shouldHideAdmin && (
        <div className="admin-only" style={{ marginTop: '0.75rem' }}>
          <div className="form-row">
            <input
              type="text"
              className="field-team"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
              style={{ maxWidth: '200px' }}
            />
            <button type="button" className="add-btn" onClick={handleAddTeam}>
              Add Team
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
