'use client'

import { useView } from '../context/ViewContext'
import { useEffect } from 'react'

export default function ViewWrapper({ children }) {
  const { view } = useView()

  useEffect(() => {
    if (view === 'leadership') {
      document.body.classList.add('leadership-view')
    } else {
      document.body.classList.remove('leadership-view')
    }
  }, [view])

  return children
}
