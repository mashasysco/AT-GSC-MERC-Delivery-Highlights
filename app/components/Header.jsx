'use client'

import { useView } from '../context/ViewContext'


export default function Header() {
  const { view, setViewMode } = useView()

  return (
    <header className="header">
      <h1>Delivery Dashboard</h1>
      <div className="view-toggle">
        <button
          onClick={() => setViewMode('admin')}
          className={`view-toggle-btn ${view === 'admin' ? 'active' : ''}`}
        >
          Admin Portal
        </button>
        <button
          onClick={() => setViewMode('leadership')}
          className={`view-toggle-btn ${view === 'leadership' ? 'active' : ''}`}
        >
          Leadership View
        </button>
      </div>
      <span className="branding">Sysco | Technology — Proprietary &amp; Confidential</span>
    </header>
  )
}
