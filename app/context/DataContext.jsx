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
      actionItems: [
        ...(prev.actionItems || []),
        { text, status, notes }
      ]
    }))
  }

  const updateActionItem = (index, updates) => {
    setData(prev => ({
      ...prev,
      actionItems: (prev.actionItems || []).map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    }))
  }

  const removeActionItem = (index) => {
    setData(prev => ({
      ...prev,
      actionItems: (prev.actionItems || []).filter((_, i) => i !== index)
    }))
  }

  // Highlights (TeamGroups with Teams with KeyHighlights)
  const addTeamGroup = (teamGroup) => {
    setData(prev => ({
      ...prev,
      highlights: [
        ...(prev.highlights || []),
        { teamGroup, teams: [] }
      ]
    }))
  }

  const removeTeamGroup = (teamGroupIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== teamGroupIndex)
    }))
  }

  const updateTeamGroupName = (teamGroupIndex, newName) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, i) =>
        i === teamGroupIndex ? { ...tg, teamGroup: newName } : tg
      )
    }))
  }

  const addTeam = (teamGroupIndex, teamName) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: [
              ...(tg.teams || []),
              { teamName, keyHighlights: [] }
            ]
          }
          : tg
      )
    }))
  }

  const removeTeam = (teamGroupIndex, teamIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.filter((_, i) => i !== teamIndex)
          }
          : tg
      )
    }))
  }

  const updateTeamName = (teamGroupIndex, teamIndex, newName) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex ? { ...team, teamName: newName } : team
            )
          }
          : tg
      )
    }))
  }

  const addKeyHighlight = (teamGroupIndex, teamIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: [
                    ...(team.keyHighlights || []),
                    {
                      text: '',
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
          }
          : tg
      )
    }))
  }

  const updateKeyHighlight = (teamGroupIndex, teamIndex, highlightIndex, updates) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: team.keyHighlights.map((kh, khi) =>
                    khi === highlightIndex ? { ...kh, ...updates } : kh
                  )
                }
                : team
            )
          }
          : tg
      )
    }))
  }

  const removeKeyHighlight = (teamGroupIndex, teamIndex, highlightIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: team.keyHighlights.filter((_, i) => i !== highlightIndex)
                }
                : team
            )
          }
          : tg
      )
    }))
  }

  const addReleaseToKeyHighlight = (teamGroupIndex, teamIndex, highlightIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: team.keyHighlights.map((kh, khi) =>
                    khi === highlightIndex
                      ? {
                        ...kh,
                        releases: [
                          ...(kh.releases || []),
                          { releaseName: '', releaseDate: '' }
                        ]
                      }
                      : kh
                  )
                }
                : team
            )
          }
          : tg
      )
    }))
  }

  const updateReleaseInKeyHighlight = (teamGroupIndex, teamIndex, highlightIndex, releaseIndex, updates) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: team.keyHighlights.map((kh, khi) =>
                    khi === highlightIndex
                      ? {
                        ...kh,
                        releases: kh.releases.map((rel, ri) =>
                          ri === releaseIndex ? { ...rel, ...updates } : rel
                        )
                      }
                      : kh
                  )
                }
                : team
            )
          }
          : tg
      )
    }))
  }

  const removeReleaseFromKeyHighlight = (teamGroupIndex, teamIndex, highlightIndex, releaseIndex) => {
    setData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).map((tg, tgi) =>
        tgi === teamGroupIndex
          ? {
            ...tg,
            teams: tg.teams.map((team, ti) =>
              ti === teamIndex
                ? {
                  ...team,
                  keyHighlights: team.keyHighlights.map((kh, khi) =>
                    khi === highlightIndex
                      ? {
                        ...kh,
                        releases: kh.releases.filter((_, i) => i !== releaseIndex)
                      }
                      : kh
                  )
                }
                : team
            )
          }
          : tg
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

  const clearAllData = () => {
    setData({
      actionItems: [],
      highlights: [],
      releases: [],
      'product-plan': [],
      'resource-dashboard': [],
      learnings: []
    })
  }

  const value = {
    data,
    // Action Items
    addActionItem,
    updateActionItem,
    removeActionItem,
    // Highlights
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
    removeReleaseFromKeyHighlight,
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
    clearAllData,
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
