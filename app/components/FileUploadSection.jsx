'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useView } from '../context/ViewContext'

export default function FileUploadSection() {
  const { data: contextData, addActionItem, addTeamGroup, addTeam, addKeyHighlight, updateKeyHighlight, addReleaseToKeyHighlight, updateReleaseInKeyHighlight, addRelease, addLink, addLearning, clearAllData } = useData()
  const { view } = useView()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'clear' or 'upload'

  const shouldHideAdmin = view === 'leadership'

  const handleClearData = () => {
    clearAllData()
    setFile(null)
    setMessage('')
    setError('')
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  const handleConfirmClearAndUpload = () => {
    clearAllData()
    setShowConfirmModal(false)
    handleSubmitAfterClear()
  }

  const handleSubmitAfterClear = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setMessage('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Populate the data context with the response
      if (result.data) {
        populateDataFromResponse(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const populateDataFromResponse = (data) => {
    const { actionItems, highlights, productPlan, resourceDashboard, learnings, releases } = data

    // Add action items
    if (actionItems && Array.isArray(actionItems)) {
      actionItems.forEach(item => {
        addActionItem(item.text, item.status || 'Not Started', item.notes || '')
      })
    }

    // Add highlights with new teamGroup structure
    if (highlights && Array.isArray(highlights)) {
      highlights.forEach((teamGroup, tgIdx) => {
        addTeamGroup(teamGroup.teamGroup)
        // Add a small delay before adding teams to ensure teamGroup is in state
        setTimeout(() => {
          if (teamGroup.teams && Array.isArray(teamGroup.teams)) {
            teamGroup.teams.forEach((team, teamIdx) => {
              addTeam(tgIdx, team.teamName)
              // Add another small delay before adding highlights
              setTimeout(() => {
                if (team.keyHighlights && Array.isArray(team.keyHighlights)) {
                  team.keyHighlights.forEach((highlight, highlightIdx) => {
                    addKeyHighlight(tgIdx, teamIdx)
                    // Update with data immediately (no additional delay needed)
                    setTimeout(() => {
                      updateKeyHighlight(tgIdx, teamIdx, highlightIdx, {
                        text: highlight.text,
                        rag: highlight.rag,
                        eta: highlight.eta,
                        raid: highlight.raid,
                        challenges: highlight.challenges
                      })
                      // Add releases to this key highlight
                      if (highlight.releases && Array.isArray(highlight.releases)) {
                        highlight.releases.forEach((release, relIdx) => {
                          addReleaseToKeyHighlight(tgIdx, teamIdx, highlightIdx)
                          setTimeout(() => {
                            updateReleaseInKeyHighlight(tgIdx, teamIdx, highlightIdx, relIdx, {
                              releaseName: release.releaseName,
                              releaseDate: release.releaseDate
                            })
                          }, 50)
                        })
                      }
                    }, 50)
                  })
                }
              }, 50)
            })
          }
        }, 50)
      })
    }

    // Add releases
    if (releases && Array.isArray(releases)) {
      releases.forEach(rel => {
        addRelease(rel.releaseName, rel.releaseDate, rel.releaseOpCo, rel.releaseStatus)
      })
    }

    // Add product plan links
    if (productPlan && Array.isArray(productPlan)) {
      productPlan.forEach(link => {
        addLink('product-plan', link)
      })
    }

    // Add resource dashboard links
    if (resourceDashboard && Array.isArray(resourceDashboard)) {
      resourceDashboard.forEach(link => {
        addLink('resource-dashboard', link)
      })
    }

    // Add learnings
    if (learnings && Array.isArray(learnings)) {
      learnings.forEach(learning => {
        addLearning(learning)
      })
    }

    setMessage('File processed successfully! Data has been populated.')
    setFile(null)
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }



  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
      setMessage('')
    } else {
      setError('Please select a valid PDF file')
      setFile(null)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    // Check if there's already data
    const hasExistingData = contextData && (
      (contextData.actionItems && contextData.actionItems.length > 0) ||
      (contextData.highlights && contextData.highlights.length > 0) ||
      (contextData.releases && contextData.releases.length > 0)
    )

    if (hasExistingData) {
      // Show confirmation modal
      setShowConfirmModal(true)
    } else {
      // No existing data, proceed with upload
      await handleSubmitAfterClear()
    }
  }

  if (shouldHideAdmin) {
    return null
  }

  return (
    <div style={{
      padding: '1.5rem 2rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      marginBottom: '2rem',
      width: '100%'
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text)'
      }}>
        Populate from PDF
      </h3>

      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <label style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
          position: 'relative'
        }}>
          <span style={{
            color: file ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            {file ? file.name : 'Choose File'}
          </span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              pointerEvents: uploading ? 'none' : 'auto'
            }}
          />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading || !file}
          style={{
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1.5rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: uploading || !file ? 'not-allowed' : 'pointer',
            opacity: uploading || !file ? 0.6 : 1,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {uploading && (
            <span style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          )}
          {uploading ? 'Processing...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={handleClearData}
          disabled={uploading}
          style={{
            padding: '0.5rem 1rem',
            background: '#5f6368',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.5 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          Clear All Data
        </button>
      </div>

      {message && (
        <p style={{
          fontSize: '0.9rem',
          color: '#4caf50',
          marginTop: '0.75rem',
          padding: '0.75rem',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '6px',
          border: '1px solid #4caf50'
        }}>
          ✓ {message}
        </p>
      )}

      {error && (
        <p style={{
          fontSize: '0.9rem',
          color: '#f44336',
          marginTop: '0.75rem',
          padding: '0.75rem',
          background: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '6px',
          border: '1px solid #f44336'
        }}>
          ✗ {error}
        </p>
      )}

      {uploading && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid rgba(100,150,200,0.3)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Processing PDF and populating data...
          </p>
        </div>
      )}

      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--text)', fontSize: '1.1rem', fontWeight: '600' }}>Clear Existing Data?</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>You have existing data in the dashboard. Uploading a new PDF will replace it. Clear all data and proceed with the upload?</p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: '6px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAndUpload}
                style={{
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                Clear and Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
