import Card from './Card'

export default function LearningsCard({ items = [] }) {
  const displayItems = items

  return (
    <Card number="05" title="New Learnings / Improvements">
      {displayItems.length === 0 ? (
        <p className="empty-state">No learnings or improvements yet.</p>
      ) : (
        <ul>
          {displayItems.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span>{item}</span>
              <button type="button" className="admin-only" style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2em',
                lineHeight: '1',
                padding: '0',
                flexShrink: 0
              }}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="add-item admin-only">
        <input type="text" placeholder="Add learning or improvement..." />
        <button type="button">Add</button>
      </div>
    </Card>
  )
}
