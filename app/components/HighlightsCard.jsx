'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { useView } from '../context/ViewContext'
import { useData } from '../context/DataContext'
import Card from './Card'

export default function HighlightsCard() {
  const {
    data,
    addTeamGroup,
    removeTeamGroup,
    updateTeamGroupName,
    addTeam,
    removeTeam,
    updateTeamName,
    addKeyHighlight,
    updateKeyHighlight,
    removeKeyHighlight,
    addReleaseToKeyHighlight,
    updateReleaseInKeyHighlight,
    removeReleaseFromKeyHighlight
  } = useData()
  const { view } = useView()
  const [newTeamGroupName, setNewTeamGroupName] = useState('')
  const [editingHighlight, setEditingHighlight] = useState(null)
  const [editingRelease, setEditingRelease] = useState(null)
  const [formData, setFormData] = useState({})
  const [collapsedTeamGroups, setCollapsedTeamGroups] = useState({})

  const teamGroups = data.highlights || []
  const shouldHideAdmin = view === 'leadership'

  const ragColors = {
    'Red': 'rag-red',
    'Amber': 'rag-amber',
    'Green': 'rag-green'
  }

  const toggleTeamGroupCollapse = (tgIdx) => {
    setCollapsedTeamGroups(prev => ({
      ...prev,
      [tgIdx]: !prev[tgIdx]
    }))
  }



  const handleAddTeamGroup = () => {
    if (newTeamGroupName.trim()) {
      addTeamGroup(newTeamGroupName.trim())
      setNewTeamGroupName('')
    }
  }

  const handleEditTeamGroup = (tgIdx) => {
    const newName = prompt('Team Group name:', teamGroups[tgIdx].teamGroup)
    if (newName && newName.trim()) {
      updateTeamGroupName(tgIdx, newName.trim())
    }
  }

  const handleEditTeam = (tgIdx, teamIdx) => {
    const newName = prompt('Team name:', teamGroups[tgIdx].teams[teamIdx].teamName)
    if (newName && newName.trim()) {
      updateTeamName(tgIdx, teamIdx, newName.trim())
    }
  }

  const handleEditHighlight = (tgIdx, teamIdx, highlightIdx, highlight) => {
    setEditingHighlight({ tgIdx, teamIdx, highlightIdx })
    setFormData({
      text: highlight.text,
      rag: highlight.rag,
      eta: highlight.eta,
      raid: highlight.raid,
      challenges: highlight.challenges
    })
  }

  const handleSaveHighlight = () => {
    const { tgIdx, teamIdx, highlightIdx } = editingHighlight
    updateKeyHighlight(tgIdx, teamIdx, highlightIdx, formData)
    setEditingHighlight(null)
    setFormData({})
  }

  const handleEditRelease = (tgIdx, teamIdx, highlightIdx, releaseIdx, release) => {
    setEditingRelease({ tgIdx, teamIdx, highlightIdx, releaseIdx })
    setFormData({
      releaseName: release.releaseName,
      releaseDate: release.releaseDate
    })
  }

  const handleSaveRelease = () => {
    const { tgIdx, teamIdx, highlightIdx, releaseIdx } = editingRelease
    updateReleaseInKeyHighlight(tgIdx, teamIdx, highlightIdx, releaseIdx, formData)
    setEditingRelease(null)
    setFormData({})
  }

  return (
    <Card number="02" title="Delivery Highlights &amp; Challenges">
      {teamGroups.length === 0 ? (
        <p className="empty-state">No team groups yet. Add a team group below.</p>
      ) : (
        <ul>
          {teamGroups.map((teamGroup, tgIdx) => (
            <li key={tgIdx} style={{ listStyle: 'none', marginBottom: '2rem' }}>
              {/* Team Group Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => toggleTeamGroupCollapse(tgIdx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      transition: 'transform 0.2s ease',
                      transform: collapsedTeamGroups[tgIdx] ? 'rotate(-90deg)' : 'rotate(0deg)',
                      fontSize: '1.1rem'
                    }}
                  >
                    ▼
                  </span>
                  <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                    {teamGroup.teamGroup}
                  </h2>
                </div>
                {!shouldHideAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => {
                        const newName = prompt('Team Group name:', teamGroup.teamGroup)
                        if (newName && newName.trim()) {
                          updateTeamGroupName(tgIdx, newName.trim())
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeTeamGroup(tgIdx)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {!collapsedTeamGroups[tgIdx] && (
                <>
              {/* Grid of Teams */}
              <div className='grid' style={{ marginBottom: '1rem' }}>
                {teamGroup.teams && teamGroup.teams.map((team, teamIdx) => (
                  <div 
                    key={teamIdx} 
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Team Header */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '0.75rem',
                        gap: '0.5rem'
                      }}
                    >
                      <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>
                        {team.teamName}
                      </h3>
                      {!shouldHideAdmin && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => {
                              const newName = prompt('Team name:', team.teamName)
                              if (newName && newName.trim()) {
                                updateTeamName(tgIdx, teamIdx, newName.trim())
                              }
                            }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeTeam(tgIdx, teamIdx)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Key Highlights List */}
                    <div style={{ flex: 1 }}>
                      {team.keyHighlights && team.keyHighlights.length > 0 ? (
                        team.keyHighlights.map((highlight, highlightIdx) => (
                          highlight.text ? (
                            <div 
                              key={highlightIdx} 
                              style={{
                                marginBottom: '0.75rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s ease',
                                cursor: 'default'
                              }}
                              className="highlight-item"
                            >
                              {editingHighlight?.tgIdx === tgIdx && editingHighlight?.teamIdx === teamIdx && editingHighlight?.highlightIdx === highlightIdx ? (
                                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                  <textarea
                                    placeholder="Highlight text"
                                    value={formData.text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                    style={{ width: '100%', marginBottom: '0.5rem', minHeight: '50px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }}
                                  />
                                  <select
                                    value={formData.rag}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rag: e.target.value }))}
                                    style={{ width: '100%', marginBottom: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem' }}
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
                                    style={{ width: '100%', marginBottom: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem' }}
                                  />
                                  <textarea
                                    placeholder="RAID"
                                    value={formData.raid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, raid: e.target.value }))}
                                    style={{ width: '100%', marginBottom: '0.5rem', minHeight: '40px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }}
                                  />
                                  <textarea
                                    placeholder="Challenges"
                                    value={formData.challenges}
                                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                                    style={{ width: '100%', marginBottom: '0.5rem', minHeight: '40px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }}
                                  />
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateKeyHighlight(tgIdx, teamIdx, highlightIdx, formData)
                                        setEditingHighlight(null)
                                        setFormData({})
                                      }}
                                      style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '4px', padding: '0.4rem 0.75rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingHighlight(null)}
                                      style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ color: 'var(--text)', fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {highlight.text}
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div
                                          style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: highlight.rag === 'Red' ? '#c62828' : highlight.rag === 'Amber' ? '#f9a825' : '#2e7d32',
                                            flexShrink: 0
                                          }}
                                          title={`Status: ${highlight.rag}`}
                                        />
                                        {highlight.eta && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ETA: {highlight.eta}</span>}
                                      </div>
                                    </div>
                                    {!shouldHideAdmin && (
                                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} className="highlight-actions">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingHighlight({ tgIdx, teamIdx, highlightIdx })
                                            setFormData({
                                              text: highlight.text,
                                              rag: highlight.rag,
                                              eta: highlight.eta,
                                              raid: highlight.raid,
                                              challenges: highlight.challenges
                                            })
                                          }}
                                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease, color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          title="Edit highlight"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeKeyHighlight(tgIdx, teamIdx, highlightIdx)}
                                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease, color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          title="Delete highlight"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {highlight.raid && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><strong>RAID:</strong> {highlight.raid}</div>}
                                  {highlight.challenges && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><strong>Challenges:</strong> {highlight.challenges}</div>}
                                  {highlight.releases && highlight.releases.length > 0 && (
                                    <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--border)' }}>
                                      {highlight.releases.map((release, relIdx) => (
                                        <div key={relIdx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                          <span>{release.releaseName} {release.releaseDate && `(${release.releaseDate})`}</span>
                                          {!shouldHideAdmin && (
                                            <div style={{ display: 'flex', gap: '0.15rem' }} className="release-actions">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingRelease({ tgIdx, teamIdx, highlightIdx, releaseIdx: relIdx })
                                                  setFormData({
                                                    releaseName: release.releaseName,
                                                    releaseDate: release.releaseDate
                                                  })
                                                }}
                                                style={{ padding: '0.1rem 0.25rem', fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease, color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Edit release"
                                              >
                                                <Edit2 size={14} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => removeReleaseFromKeyHighlight(tgIdx, teamIdx, highlightIdx, relIdx)}
                                                style={{ padding: '0.1rem 0.25rem', fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease, color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Delete release"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {editingRelease?.tgIdx === tgIdx && editingRelease?.teamIdx === teamIdx && editingRelease?.highlightIdx === highlightIdx && (
                                    <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.3rem', fontSize: '0.8rem' }}>
                                      <input
                                        type="text"
                                        placeholder="Release name"
                                        value={formData.releaseName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, releaseName: e.target.value }))}
                                        style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.3rem', color: 'var(--text)' }}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Date"
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                                        style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.3rem', color: 'var(--text)' }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateReleaseInKeyHighlight(tgIdx, teamIdx, highlightIdx, editingRelease.releaseIdx, formData)
                                          setEditingRelease(null)
                                          setFormData({})
                                        }}
                                        style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '3px', padding: '0.3rem 0.5rem', fontWeight: '600', cursor: 'pointer' }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingRelease(null)}
                                        style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                  {!shouldHideAdmin && (
                                    <button
                                      type="button"
                                      className="btn-edit"
                                      onClick={() => addReleaseToKeyHighlight(tgIdx, teamIdx, highlightIdx)}
                                      style={{ marginTop: '0.25rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                    >
                                      + Release
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          ) : null
                        ))
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No highlights yet. Add your first highlight below.
                        </div>
                      )}
                    </div>

                    {!shouldHideAdmin && (
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => addKeyHighlight(tgIdx, teamIdx)}
                        style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        + Add Highlight
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!shouldHideAdmin && (
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => addTeam(tgIdx, 'New Team')}
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  + Add Team
                </button>
              )}
                </>
              )}
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
              placeholder="Team Group name"
              value={newTeamGroupName}
              onChange={(e) => setNewTeamGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeamGroup()}
              style={{ maxWidth: '200px' }}
            />
            <button type="button" className="add-btn" onClick={handleAddTeamGroup}>
              Add Team Group
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
