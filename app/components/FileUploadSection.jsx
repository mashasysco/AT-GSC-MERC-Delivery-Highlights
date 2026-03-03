'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useView } from '../context/ViewContext'

export default function FileUploadSection() {
  const { data: contextData, addActionItem, addTeam, addInitiative, updateInitiative, addReleaseToInitiative, updateReleaseInInitiative, addRelease, addLink, addLearning } = useData()
  const { view } = useView()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const shouldHideAdmin = view === 'leadership'

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
        const { actionItems, highlights, productPlan, resourceDashboard, learnings, releases } = result.data

        // Add action items
        if (actionItems && Array.isArray(actionItems)) {
          actionItems.forEach(item => {
            addActionItem(item.text, item.status || 'Not Started', item.notes || '')
          })
        }

        // Add highlights with nested structure
        if (highlights && Array.isArray(highlights)) {
          highlights.forEach((team, teamIdx) => {
            addTeam(team.teamName)
            if (team.initiatives && Array.isArray(team.initiatives)) {
              team.initiatives.forEach((init, initIdx) => {
                addInitiative(teamIdx)
                // Update the newly added initiative
                setTimeout(() => {
                  updateInitiative(teamIdx, initIdx, {
                    name: init.name,
                    keyHighlights: init.keyHighlights,
                    rag: init.rag,
                    eta: init.eta,
                    raid: init.raid,
                    challenges: init.challenges
                  })

                  // Add releases to this initiative
                  if (init.releases && Array.isArray(init.releases)) {
                    init.releases.forEach((release, relIdx) => {
                      addReleaseToInitiative(teamIdx, initIdx)
                      setTimeout(() => {
                        updateReleaseInInitiative(teamIdx, initIdx, relIdx, {
                          releaseName: release.releaseName,
                          releaseDate: release.releaseDate
                        })
                      }, 100)
                    })
                  }
                }, 100)
              })
            }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
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
      maxWidth: '600px'
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
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            flex: 1,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'var(--text)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1
          }}
        />
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
            whiteSpace: 'nowrap'
          }}
        >
          {uploading ? 'Processing...' : 'Submit'}
        </button>
      </div>

      {file && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem'
        }}>
          Selected: {file.name}
        </p>
      )}

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
    </div>
  )
}
