'use client'

import { useState } from 'react'

export default function Card({ number, title, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <section className="card">
      <div 
        className="card-header"
        style={{ cursor: 'pointer',  userSelect: 'none' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="card-num">{number}</span>
        <h2 className="card-title">{title}</h2>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '1.2em',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
        >
          ▼
        </button>
      </div>
      {!isCollapsed && (
        <div className="card-body">
          {children}
        </div>
      )}
    </section>
  )
}
