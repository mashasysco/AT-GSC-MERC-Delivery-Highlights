'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

const STORAGE_KEY = 'delivery-dashboard-data'

export function DataProvider({ children }) {
  const [data, setData] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      setData(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  // Action Items
  const addActionItem = (text, status = 'Not Started', notes = '') => {
    setData(prev => ({
      ...prev,
      'action-items': [
        ...(prev['action-items'] || []),
        { text, status, notes }
      ]
    }))
  }

  const updateActionItem = (index, updates) => {
    setData(prev => ({
      ...prev,
      'action-items': prev['action-items'].map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    }))
  }

  const removeActionItem = (index) => {
    setData(prev => ({
      ...prev,
      'action-items': prev['action-items'].filter((_, i) => i !== index)
    }))
  }

  // Highlights (Teams with Initiatives)
  const addTeam = (teamName) => {
    setData(prev => ({
      ...prev,
      highlights: [
        ...(prev.highlights || []),
        { teamName, initiatives: [] }
      ]
    }))
  }

  const removeTeam = (teamIndex) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== teamIndex)
    }))
  }

  const updateTeamName = (teamIndex, newName) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, i) =>
        i === teamIndex ? { ...team, teamName: newName } : team
      )
    }))
  }

  const addInitiative = (teamIndex) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, i) =>
        i === teamIndex
          ? {
            ...team,
            initiatives: [
              ...(team.initiatives || []),
              {
                name: 'New Initiative',
                keyHighlights: '',
                rag: 'Green',
                eta: '',
                raid: '',
                challenges: '',
                releases: []
              }
            ]
          }
          : team
      )
    }))
  }

  const updateInitiative = (teamIndex, initIndex, updates) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, ti) =>
        ti === teamIndex
          ? {
            ...team,
            initiatives: team.initiatives.map((init, ii) =>
              ii === initIndex ? { ...init, ...updates } : init
            )
          }
          : team
      )
    }))
  }

  const removeInitiative = (teamIndex, initIndex) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, ti) =>
        ti === teamIndex
          ? {
            ...team,
            initiatives: team.initiatives.filter((_, i) => i !== initIndex)
          }
          : team
      )
    }))
  }

  const addReleaseToInitiative = (teamIndex, initIndex) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, ti) =>
        ti === teamIndex
          ? {
            ...team,
            initiatives: team.initiatives.map((init, ii) =>
              ii === initIndex
                ? {
                  ...init,
                  releases: [
                    ...(init.releases || []),
                    { releaseName: '', releaseDate: '' }
                  ]
                }
                : init
            )
          }
          : team
      )
    }))
  }

  const updateReleaseInInitiative = (teamIndex, initIndex, releaseIndex, updates) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, ti) =>
        ti === teamIndex
          ? {
            ...team,
            initiatives: team.initiatives.map((init, ii) =>
              ii === initIndex
                ? {
                  ...init,
                  releases: init.releases.map((rel, ri) =>
                    ri === releaseIndex ? { ...rel, ...updates } : rel
                  )
                }
                : init
            )
          }
          : team
      )
    }))
  }

  const removeReleaseFromInitiative = (teamIndex, initIndex, releaseIndex) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((team, ti) =>
        ti === teamIndex
          ? {
            ...team,
            initiatives: team.initiatives.map((init, ii) =>
              ii === initIndex
                ? {
                  ...init,
                  releases: init.releases.filter((_, i) => i !== releaseIndex)
                }
                : init
            )
          }
          : team
      )
    }))
  }

  // Releases
  const addRelease = (releaseName, releaseDate, releaseOpCo, releaseStatus = 'Planned') => {
    setData(prev => ({
      ...prev,
      releases: [
        ...(prev.releases || []),
        { releaseName, releaseDate, releaseOpCo, releaseStatus }
      ]
    }))
  }

  const updateRelease = (index, updates) => {
    setData(prev => ({
      ...prev,
      releases: prev.releases.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    }))
  }

  const removeRelease = (index) => {
    setData(prev => ({
      ...prev,
      releases: prev.releases.filter((_, i) => i !== index)
    }))
  }

  // Product Plan & Resource Dashboard Links
  const addLink = (section, link) => {
    setData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), link]
    }))
  }

  const updateLink = (section, index, link) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? link : item
      )
    }))
  }

  const removeLink = (section, index) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  // Learnings
  const addLearning = (learning) => {
    setData(prev => ({
      ...prev,
      learnings: [...(prev.learnings || []), learning]
    }))
  }

  const updateLearning = (index, learning) => {
    setData(prev => ({
      ...prev,
      learnings: prev.learnings.map((item, i) =>
        i === index ? learning : item
      )
    }))
  }

  const removeLearning = (index) => {
    setData(prev => ({
      ...prev,
      learnings: prev.learnings.filter((_, i) => i !== index)
    }))
  }

  const value = {
    data,
    // Action Items
    addActionItem,
    updateActionItem,
    removeActionItem,
    // Highlights
    addTeam,
    removeTeam,
    updateTeamName,
    addInitiative,
    updateInitiative,
    removeInitiative,
    addReleaseToInitiative,
    updateReleaseInInitiative,
    removeReleaseFromInitiative,
    // Releases
    addRelease,
    updateRelease,
    removeRelease,
    // Links
    addLink,
    updateLink,
    removeLink,
    // Learnings
    addLearning,
    updateLearning,
    removeLearning,
    isLoaded
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
