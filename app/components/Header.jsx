'use client'

import { useState } from 'react'

export default function Header() {
  const [view, setView] = useState('admin')

  return (
    <header className="header">
      <h1>Delivery Dashboard</h1>
      <div className="view-toggle">
        <button
          onClick={() => setView('admin')}
          className={`view-toggle-btn ${view === 'admin' ? 'active' : ''}`}
        >
          Admin Portal
        </button>
        <button
          onClick={() => setView('leadership')}
          className={`view-toggle-btn ${view === 'leadership' ? 'active' : ''}`}
        >
          Leadership View
        </button>
      </div>
      <span className="branding">Sysco | Technology — Proprietary &amp; Confidential</span>
    </header>
  )
}
