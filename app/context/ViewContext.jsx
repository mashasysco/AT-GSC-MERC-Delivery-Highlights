'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ViewContext = createContext()

const VIEW_STORAGE_KEY = 'delivery-dashboard-view'

export function ViewProvider({ children }) {
  const [view, setView] = useState('admin')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(VIEW_STORAGE_KEY)
    setView(stored || 'admin')
    setIsLoaded(true)
  }, [])

  const setViewMode = (mode) => {
    setView(mode)
    sessionStorage.setItem(VIEW_STORAGE_KEY, mode)
  }

  return (
    <ViewContext.Provider value={{ view, setViewMode, isLoaded }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error('useView must be used within ViewProvider')
  }
  return context
}
